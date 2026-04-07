using Lefarma.API.Domain.Entities.Operaciones;

namespace Lefarma.API.Features.OrdenesCompra.Firmas.Handlers
{
    /// <summary>
    /// Aplica un valor a un campo de la OrdenCompra usando reflexión sobre PropiedadEntidad del WorkflowCampo.
    /// El tipo se infiere de TipoControl: Checkbox→bool, Selector/Numero→int, resto→string.
    /// Requiere que el handler tenga id_workflow_campo con propiedad_entidad definida.
    /// </summary>
    public class FieldUpdaterWorkflowHandler : IWorkflowActionHandler
    {
        public string HandlerKey => "FieldUpdater";

        public Task<HandlerResult> ProcessAsync(WorkflowHandlerContext context, string? configJson)
        {
            if (context.Handler?.Campo is not { } campo)
                return Task.FromResult(HandlerResult.Fail("FieldUpdater: el handler no tiene un campo vinculado."));

            if (string.IsNullOrWhiteSpace(campo.PropiedadEntidad))
                return Task.FromResult(HandlerResult.Fail($"FieldUpdater: el campo '{campo.EtiquetaUsuario}' no tiene propiedad_entidad configurada."));

            if (context.DatosAdicionales is null ||
                !context.DatosAdicionales.TryGetValue(campo.NombreTecnico, out var rawObj))
                return Task.FromResult(HandlerResult.Fail($"FieldUpdater: campo '{campo.EtiquetaUsuario}' no proporcionado en la solicitud."));

            var prop = typeof(OrdenCompra).GetProperty(campo.PropiedadEntidad);
            if (prop is null)
                return Task.FromResult(HandlerResult.Fail($"FieldUpdater: propiedad '{campo.PropiedadEntidad}' no existe en OrdenCompra."));

            try
            {
                var rawValue = rawObj?.ToString();
                object? typed = campo.TipoControl.ToLowerInvariant() switch
                {
                    "checkbox" or "booleano" => bool.TryParse(rawValue, out var b) ? b : (object?)null,
                    "selector" or "numero"   => int.TryParse(rawValue, out var n) ? n : (object?)null,
                    _                        => rawValue
                };

                if (typed is null)
                    return Task.FromResult(HandlerResult.Fail($"FieldUpdater: valor inválido para '{campo.EtiquetaUsuario}'."));

                prop.SetValue(context.Orden, typed);
                return Task.FromResult(HandlerResult.Ok());
            }
            catch (Exception ex)
            {
                return Task.FromResult(HandlerResult.Fail($"FieldUpdater: error al aplicar '{campo.EtiquetaUsuario}': {ex.Message}"));
            }
        }
    }
}
