using Lefarma.API.Domain.Interfaces.Logging;
using Lefarma.API.Shared.Logging;
using Microsoft.Extensions.Logging;
using Serilog;
using System.Diagnostics;

namespace Lefarma.API.Infrastructure.Middleware;

/// <summary>
/// Middleware that creates and emits a WideEvent for each HTTP request.
/// Implements the "one rich event per request" logging philosophy (loggingsucks.com).
///
/// Flow:
/// 1. Create WideEvent at start -> store in HttpContext.Items
/// 2. Services can enrich it via IWideEventAccessor
/// 3. Emit ONE single log at the end (finally block)
/// 4. If error occurs, persist to database via ErrorLogService
/// </summary>
public sealed class WideEventLoggingMiddleware(
    RequestDelegate next, 
    ILogger<WideEventLoggingMiddleware> logger,
    IServiceScopeFactory scopeFactory)
{
    private const string WideEventKey = "WideEvent";
    private readonly RequestDelegate _next = next;
    private readonly ILogger<WideEventLoggingMiddleware> _logger = logger;
    private readonly Serilog.ILogger _serilogLogger = Log.ForContext<WideEventLoggingMiddleware>();
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var wideEvent = CreateWideEvent(context);

        // Store WideEvent in HttpContext.Items for enrichment by services
        context.Items[WideEventKey] = wideEvent;

        try
        {
            await _next(context);
            stopwatch.Stop();
            CompleteRequest(wideEvent, context, stopwatch.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            EmitError(wideEvent, context, stopwatch.ElapsedMilliseconds, ex);
            throw;
        }
    }

    private WideEvent CreateWideEvent(HttpContext context)
    {
        var traceId = context.TraceIdentifier;
        Guid.TryParse(traceId, out var parsedTraceId);

        var wideEvent = new WideEvent
        {
            RequestId = Guid.NewGuid(),
            TraceId = parsedTraceId,
            Method = context.Request.Method,
            Endpoint = context.Request.Path.Value ?? "/",
            UserId = context.User.FindFirst("sub")?.Value ?? context.User.FindFirst("userId")?.Value,
            Timestamp = DateTime.UtcNow,
            Service = "Lefarma.API",
            Version = "1.0.0"
        };

        // HTTP Context
        var userAgent = context.Request.Headers.UserAgent.ToString();
        wideEvent.UserAgent = userAgent.Length > 512 ? userAgent[..512] : userAgent;
        wideEvent.IpAddress = GetClientIpAddress(context);

        return wideEvent;
    }

    private void CompleteRequest(WideEvent evt, HttpContext context, long durationMs)
    {
        evt.StatusCode = context.Response.StatusCode;
        evt.DurationMs = durationMs;
        evt.Status = GetStatusCategory(context.Response.StatusCode);

        // Si es error de cliente y no se ha enriquecido desde el servicio marcar que el error viene del resultado HTTP
        if (context.Response.StatusCode >= 400 && context.Response.StatusCode < 500
       && string.IsNullOrEmpty(evt.ErrorType))
        {
            evt.ErrorType = "HttpError";
            evt.ErrorCode = $"HTTP{context.Response.StatusCode}";
            evt.ErrorMessage = "Error en la petición HTTP";
        }

        // Emit ONE single log with the enriched WideEvent
        evt.EmitWithSampling(_serilogLogger);
    }

    private void EmitError(WideEvent evt, HttpContext context, long durationMs, Exception ex)
    {
        evt.StatusCode = context.Response.StatusCode;
        evt.DurationMs = durationMs;
        evt.Status = "error";
        evt.ErrorType = ex.GetType().Name;
        evt.ErrorMessage = ex.Message;
        evt.ErrorCode = ex.HResult.ToString();

        // Always emit full event for errors
        evt.Emit(_serilogLogger);
    }

    private static string GetClientIpAddress(HttpContext context)
    {
        var forwardedFor = context.Request.Headers["X-Forwarded-For"].ToString();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            var firstIp = forwardedFor.Split(',').FirstOrDefault()?.Trim();
            if (!string.IsNullOrEmpty(firstIp))
                return firstIp;
        }

        return context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }

    private static string GetStatusCategory(int statusCode) => statusCode switch
    {
        < 200 => "informational",
        < 300 => "success",
        < 400 => "client_error",
        < 500 => "client_error",
        _ => "server_error"
    };
}

/// <summary>
/// Extension methods for registering WideEventLoggingMiddleware.
/// </summary>
public static class WideEventLoggingMiddlewareExtensions
{
    /// <summary>
    /// Adds Wide Event logging middleware to the pipeline.
    /// Creates one rich log event per HTTP request with full context.
    /// </summary>
    public static IApplicationBuilder UseWideEventLogging(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<WideEventLoggingMiddleware>();
    }
}
