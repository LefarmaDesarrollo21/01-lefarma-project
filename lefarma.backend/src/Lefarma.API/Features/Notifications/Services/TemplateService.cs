using Lefarma.API.Domain.Interfaces;
using Lefarma.API.Features.Notifications.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;

namespace Lefarma.API.Features.Notifications.Services;

/// <summary>
/// Service for rendering Razor templates for notifications.
/// Uses IRazorViewEngine for rendering .cshtml templates with strongly-typed models.
/// </summary>
public class TemplateService : ITemplateService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TemplateService> _logger;
    private readonly IRazorViewEngine _razorViewEngine;
    private readonly Dictionary<string, (string Content, TemplateType Type)> _databaseTemplates;

    public TemplateService(
        IServiceProvider serviceProvider,
        ILogger<TemplateService> logger,
        IRazorViewEngine razorViewEngine)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _razorViewEngine = razorViewEngine;
        _databaseTemplates = new Dictionary<string, (string Content, TemplateType Type)>(StringComparer.OrdinalIgnoreCase);
    }

    /// <inheritdoc/>
    public async Task<string> RenderAsync(string templateId, Dictionary<string, object> data, CancellationToken ct = default)
    {
        _logger.LogDebug("Rendering template: {TemplateId}", templateId);

        try
        {
            // Get required services
            var httpContextAccessor = _serviceProvider.GetService<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
            var httpContext = httpContextAccessor?.HttpContext;
            if (httpContext == null)
            {
                throw new InvalidOperationException("HttpContext is not available. TemplateService requires an active HttpContext.");
            }

            var actionContext = new ActionContext(
                httpContext,
                httpContext.GetRouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            // Try to find file-based Razor template first
            var viewName = $"/Views/Notifications/{templateId}.cshtml";
            var viewEngineResult = _razorViewEngine.FindView(actionContext, viewName, isMainPage: false);

            if (viewEngineResult.Success && viewEngineResult.View != null)
            {
                return await RenderRazorViewAsync(viewEngineResult.View, actionContext, data, ct);
            }

            // Fallback to database-registered template
            if (_databaseTemplates.TryGetValue(templateId, out var template))
            {
                return await RenderDatabaseTemplateAsync(template, data, ct);
            }

            throw new InvalidOperationException(
                $"Template '{templateId}' not found. " +
                $"Expected file: {viewName} or register using RegisterTemplateAsync() first.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering template: {TemplateId}", templateId);
            throw;
        }
    }

    /// <inheritdoc/>
    public async Task<bool> TemplateExistsAsync(string templateId, CancellationToken ct = default)
    {
        try
        {
            var httpContextAccessor = _serviceProvider.GetService<Microsoft.AspNetCore.Http.IHttpContextAccessor>();
            var httpContext = httpContextAccessor?.HttpContext;
            if (httpContext == null)
            {
                return await Task.FromResult(false);
            }

            var actionContext = new ActionContext(
                httpContext,
                httpContext.GetRouteData(),
                new Microsoft.AspNetCore.Mvc.Abstractions.ActionDescriptor()
            );

            var viewName = $"/Views/Notifications/{templateId}.cshtml";
            var viewEngineResult = _razorViewEngine.FindView(actionContext, viewName, isMainPage: false);

            if (viewEngineResult.Success)
            {
                return true;
            }

            return await Task.FromResult(_databaseTemplates.ContainsKey(templateId));
        }
        catch
        {
            return false;
        }
    }

    /// <inheritdoc/>
    public async Task RegisterTemplateAsync(string templateId, string content, TemplateType type)
    {
        _logger.LogDebug("Registering template: {TemplateId} with type: {Type}", templateId, type);

        if (string.IsNullOrWhiteSpace(templateId))
        {
            throw new ArgumentException("Template ID cannot be null or empty.", nameof(templateId));
        }

        if (string.IsNullOrWhiteSpace(content))
        {
            throw new ArgumentException("Template content cannot be null or empty.", nameof(content));
        }

        _databaseTemplates[templateId] = (content, type);
        await Task.CompletedTask;
    }

    /// <summary>
    /// Renders a Razor view (.cshtml file) with the provided data.
    /// </summary>
    private async Task<string> RenderRazorViewAsync(
        Microsoft.AspNetCore.Mvc.ViewEngines.IView view,
        Microsoft.AspNetCore.Mvc.ActionContext actionContext,
        Dictionary<string, object> data,
        CancellationToken ct)
    {
        using var writer = new StringWriter();

        // Create ViewDataDictionary with the view model
        var viewData = new ViewDataDictionary(new Microsoft.AspNetCore.Mvc.ModelBinding.CompositeModelMetadataProvider(
                System.Linq.Enumerable.Empty<Microsoft.AspNetCore.Mvc.ModelBinding.IModelMetadataProvider>()),
            new Microsoft.AspNetCore.Mvc.ModelBinding.ModelStateDictionary())
        {
            Model = CreateViewModel(data)
        };

        // Create ViewContext with minimal required properties
        var viewContext = new ViewContext(
            view,
            viewData,
            new TempDataDictionary(actionContext.HttpContext),
            writer,
            new Microsoft.AspNetCore.Mvc.ViewFeatures.ViewDataDictionary(viewData)
        )
        {
            RouteData = actionContext.RouteData,
            ActionDescriptor = actionContext.ActionDescriptor
        };

        await view.RenderAsync(viewContext, ct);

        return writer.ToString();
    }

    /// <summary>
    /// Renders a database-stored template with simple variable substitution.
    /// </summary>
    private async Task<string> RenderDatabaseTemplateAsync(
        (string Content, TemplateType Type) template,
        Dictionary<string, object> data,
        CancellationToken ct)
    {
        var result = template.Content;

        // Simple {{variable}} substitution
        foreach (var kvp in data)
        {
            var placeholder = $"{{{{{kvp.Key}}}}}";
            var value = kvp.Value?.ToString() ?? string.Empty;
            result = result.Replace(placeholder, value);
        }

        return await Task.FromResult(result);
    }

    /// <summary>
    /// Creates a NotificationTemplateViewModel from the data dictionary.
    /// </summary>
    private NotificationTemplateViewModel CreateViewModel(Dictionary<string, object> data)
    {
        var viewModel = new NotificationTemplateViewModel();

        if (data.TryGetValue("Title", out var title))
            viewModel.Title = title?.ToString() ?? string.Empty;

        if (data.TryGetValue("Message", out var message))
            viewModel.Message = message?.ToString() ?? string.Empty;

        if (data.TryGetValue("Priority", out var priority))
            viewModel.Priority = priority?.ToString() ?? "normal";

        if (data.TryGetValue("Category", out var category))
            viewModel.Category = category?.ToString() ?? "system";

        if (data.TryGetValue("Type", out var type))
            viewModel.Type = type?.ToString() ?? "info";

        if (data.TryGetValue("SenderName", out var senderName))
            viewModel.SenderName = senderName?.ToString();

        if (data.TryGetValue("SenderEmail", out var senderEmail))
            viewModel.SenderEmail = senderEmail?.ToString();

        if (data.TryGetValue("CustomerName", out var customerName))
            viewModel.CustomerName = customerName?.ToString();

        if (data.TryGetValue("ActionUrl", out var actionUrl))
            viewModel.ActionUrl = actionUrl?.ToString();

        if (data.TryGetValue("ActionText", out var actionText))
            viewModel.ActionText = actionText?.ToString();

        if (data.TryGetValue("Icon", out var icon))
            viewModel.Icon = icon?.ToString();

        if (data.TryGetValue("NotificationId", out var notificationId))
            viewModel.NotificationId = Convert.ToInt32(notificationId);

        if (data.TryGetValue("CreatedAt", out var createdAt))
            viewModel.CreatedAt = createdAt is DateTime date ? date : DateTime.UtcNow;

        // Legacy properties
        if (data.TryGetValue("OrderId", out var orderId))
            viewModel.OrderId = orderId?.ToString();

        if (data.TryGetValue("TotalAmount", out var totalAmount))
            viewModel.TotalAmount = Convert.ToDecimal(totalAmount);

        if (data.TryGetValue("Items", out var items) && items is List<NotificationItemViewModel> itemsList)
            viewModel.Items = itemsList;

        // Additional data
        if (data.TryGetValue("AdditionalData", out var additionalData) && additionalData is Dictionary<string, object> additionalDataDict)
            viewModel.AdditionalData = additionalDataDict;

        if (data.TryGetValue("CustomData", out var customData) && customData is Dictionary<string, object> customDataDict)
            viewModel.CustomData = customDataDict;

        return viewModel;
    }

    /// <summary>
    /// Simple EmptyModelMetadataProvider for ViewDataDictionary creation.
    /// </summary>
    private class EmptyModelMetadataProvider : Microsoft.AspNetCore.Mvc.ModelBinding.IModelMetadataProvider
    {
        public Microsoft.AspNetCore.Mvc.ModelBinding.ModelMetadata GetMetadataForType(Type modelType)
        {
            return new Microsoft.AspNetCore.Mvc.ModelBinding.ModelMetadata(
                this,
                null,
                null,
                modelType,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
            );
        }

        public System.Collections.Generic.IEnumerable<Microsoft.AspNetCore.Mvc.ModelBinding.ModelMetadata> GetMetadataForProperties(Type modelType)
        {
            return System.Linq.Enumerable.Empty<Microsoft.AspNetCore.Mvc.ModelBinding.ModelMetadata>();
        }

        public Microsoft.AspNetCore.Mvc.ModelBinding.ModelMetadata GetMetadataForProperty(Func<object> modelAccessor, Type containerType, Type propertyType, string propertyName)
        {
            return GetMetadataForType(propertyType);
        }
    }
}
