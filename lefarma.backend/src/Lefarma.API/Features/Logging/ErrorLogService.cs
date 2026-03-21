using Lefarma.API.Domain.Entities.Logging;
using Lefarma.API.Domain.Interfaces.Logging;
using Lefarma.API.Infrastructure.Data;
using Lefarma.API.Shared.Extensions;
using Lefarma.API.Shared.Logging;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Lefarma.API.Features.Logging;

/// <summary>
/// Implementación del servicio de logging de errores a base de datos
/// </summary>
public class ErrorLogService(ApplicationDbContext context, ILogger<ErrorLogService> logger) : IErrorLogService
{
    private readonly ApplicationDbContext _context = context;
    private readonly ILogger<ErrorLogService> _logger = logger;

    public async Task<Guid?> LogErrorAsync(WideEvent wideEvent, Exception exception, CancellationToken cancellationToken = default)
    {
        try
        {
            var errorLog = new ErrorLog
            {
                // Identificación
                ErrorGuid = Guid.NewGuid(),
                FechaError = DateTime.UtcNow,

                // Información del error
                TipoExcepcion = exception.GetType().FullName ?? exception.GetType().Name,
                MensajeError = exception.Message.Length > 2048 
                    ? exception.Message[..2045] + "..." 
                    : exception.Message,
                MensajeDetallado = exception.GetDetailedMessage(includeStackTrace: false),
                StackTrace = exception.StackTrace,

                // Severidad - determinar basado en el tipo de excepción
                Severidad = DetermineSeverity(exception, wideEvent.StatusCode),
                Categoria = DetermineCategory(exception),

                // Contexto HTTP del WideEvent
                MetodoHttp = wideEvent.Method,
                RutaEndpoint = wideEvent.Endpoint,
                QueryString = null, // Se puede extraer del HttpContext si es necesario
                StatusCode = wideEvent.StatusCode,
                IpCliente = wideEvent.IpAddress,
                UserAgent = wideEvent.UserAgent?.Length > 1024 
                    ? wideEvent.UserAgent[..1021] + "..." 
                    : wideEvent.UserAgent,

                // Contexto de usuario
                UserId = wideEvent.UserId,
                NombreUsuario = null, // Podría enriquecerse con datos del user claims

                // Contexto de negocio del WideEvent
                EntityName = wideEvent.EntityType,
                EntityId = wideEvent.EntityId?.ToString(),
                OperacionNegocio = wideEvent.Action,
                DatosAdicionales = wideEvent.AdditionalContext.Count > 0
                    ? JsonSerializer.Serialize(wideEvent.AdditionalContext)
                    : null,

                // Información técnica
                Entorno = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                Servidor = Environment.MachineName,
                DurationMs = wideEvent.DurationMs,

                // Correlación con WideEvent
                RequestId = wideEvent.RequestId,
                TraceId = wideEvent.TraceId
            };

            await _context.Set<ErrorLog>().AddAsync(errorLog, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            return errorLog.ErrorGuid;
        }
        catch (Exception ex)
        {
            // Si falla el logging a DB, no queremos romper la aplicación
            // Solo logueamos a consola/archivo con el logger estándar
            _logger.LogError(ex, "Error al intentar guardar ErrorLog en base de datos. Error original: {OriginalError}", 
                exception.GetDetailedMessage());
            
            return null;
        }
    }

    /// <summary>
    /// Determina la severidad del error basado en el tipo de excepción y status code
    /// </summary>
    private static string DetermineSeverity(Exception exception, int statusCode)
    {
        // Critical: errores que requieren atención inmediata
        if (exception is OutOfMemoryException or StackOverflowException)
            return "Critical";

        // Error de DB
        if (exception is DbUpdateException or TimeoutException)
            return "Error";

        // Errores de cliente (4xx) son Warning
        if (statusCode >= 400 && statusCode < 500)
            return "Warning";

        // Errores de servidor (5xx) son Error
        if (statusCode >= 500)
            return "Error";

        return "Error";
    }

    /// <summary>
    /// Determina la categoría del error basado en el tipo de excepción
    /// </summary>
    private static string DetermineCategory(Exception exception)
    {
        return exception switch
        {
            DbUpdateException => "Database",
            TimeoutException => "Timeout",
            UnauthorizedAccessException => "Security",
            InvalidOperationException => "Business",
            ArgumentException or ArgumentNullException => "Validation",
            HttpRequestException => "External",
            _ => "General"
        };
    }
}
