namespace Lefarma.API.Domain.Interfaces;

/// <summary>
/// Service contract for rendering notification templates.
/// Templates support variable substitution for personalized content.
/// </summary>
public interface ITemplateService
{
    /// <summary>
    /// Renders a template with the provided data.
    /// Templates use Razor (.cshtml) syntax with NotificationTemplateViewModel as the model.
    /// File-based templates are loaded from /Views/Notifications/{templateId}.cshtml
    /// Database-registered templates support simple {{variable}} substitution.
    /// </summary>
    /// <param name="templateId">Template identifier (e.g., "Email/DefaultEmail", "Telegram/DefaultTelegram")</param>
    /// <param name="data">Dictionary of key-value pairs for template substitution</param>
    /// <param name="ct">Cancellation token for async operation</param>
    /// <returns>Rendered template content</returns>
    Task<string> RenderAsync(string templateId, Dictionary<string, object> data, CancellationToken ct = default);

    /// <summary>
    /// Checks if a template exists for the given template ID.
    /// </summary>
    /// <param name="templateId">Template identifier to check</param>
    /// <param name="ct">Cancellation token for async operation</param>
    /// <returns>True if template exists, false otherwise</returns>
    Task<bool> TemplateExistsAsync(string templateId, CancellationToken ct = default);

    /// <summary>
    /// Registers a new template in the system for database-stored templates.
    /// For Razor templates, create .cshtml files in /Views/Notifications/ instead.
    /// </summary>
    /// <param name="templateId">Unique template identifier (e.g., "welcome-email", "order-confirmation")</param>
    /// <param name="content">Template content with simple variable placeholders (e.g., "Hello {{CustomerName}}")</param>
    /// <param name="type">Template type determining the rendering format</param>
    Task RegisterTemplateAsync(string templateId, string content, TemplateType type);
}
