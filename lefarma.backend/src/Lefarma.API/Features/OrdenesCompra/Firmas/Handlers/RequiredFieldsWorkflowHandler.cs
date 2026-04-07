using Lefarma.API.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Features.OrdenesCompra.Firmas.Handlers
{
    /// <summary>
    /// Valida que el usuario haya proporcionado el valor del campo vinculado en DatosAdicionales.
    /// Para tipo_control = 'Archivo': valida que exista en BD un archivo con la etiqueta del campo.
    ///   Si campo.ValidarFiscal = true y el archivo no es imagen → placeholder para webservice fiscal.
    /// Requiere id_workflow_campo (FK).
    /// </summary>
    public class RequiredFieldsWorkflowHandler : IWorkflowActionHandler
    {
        private static readonly HashSet<string> _imageTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "image/webp", "image/bmp", "image/tiff", "image/svg+xml"
        };

        private readonly ApplicationDbContext _context;

        public RequiredFieldsWorkflowHandler(ApplicationDbContext context)
        {
            _context = context;
        }

        public string HandlerKey => "RequiredFields";

        public async Task<HandlerResult> ProcessAsync(WorkflowHandlerContext context, string? configJson)
        {
            if (context.Handler?.Campo is not { } campo)
                return HandlerResult.Fail("RequiredFields: el handler no tiene un campo vinculado.");

            // ── Campos tipo Archivo: validar que existe el documento en BD ──────────────
            if (campo.TipoControl.Equals("Archivo", StringComparison.OrdinalIgnoreCase))
            {
                var archivos = await _context.Archivos
                    .AsNoTracking()
                    .Where(a => a.Activo && a.EntidadTipo == "OrdenCompra" && a.EntidadId == context.IdOrden)
                    .ToListAsync();

                if (!archivos.Any())
                    return HandlerResult.Fail($"Esta acción requiere adjuntar: {campo.EtiquetaUsuario}.");

                var existe = archivos.Any(a =>
                    (a.Metadata ?? string.Empty).Contains(campo.EtiquetaUsuario, StringComparison.OrdinalIgnoreCase));

                if (!existe)
                    return HandlerResult.Fail($"No se encontró el documento requerido: {campo.EtiquetaUsuario}.");

                if (campo.ValidarFiscal)
                {
                    // Omitir imágenes (gastos no deducibles sin factura)
                    var contentType = context.DatosAdicionales?
                        .GetValueOrDefault("archivoContentType")?.ToString()?.Trim() ?? string.Empty;

                    if (!_imageTypes.Contains(contentType))
                    {
                        // TODO Fase 2: invocar webservice CFDI para validar PDF/XML
                        // Por ahora siempre pasa; la validación fiscal se activará al integrar el webservice
                    }
                }

                return HandlerResult.Ok();
            }

            // ── Campos de entrada (Selector, Checkbox, Texto, etc.) ─────────────────────
            if (context.DatosAdicionales is null ||
                !context.DatosAdicionales.TryGetValue(campo.NombreTecnico, out var value) ||
                string.IsNullOrWhiteSpace(value?.ToString()))
                return HandlerResult.Fail($"El campo '{campo.EtiquetaUsuario}' es obligatorio para esta acción.");

            return HandlerResult.Ok();
        }
    }
}
