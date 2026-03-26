namespace Lefarma.API.Features.Help.DTOs;

/// <summary>
/// DTO para la respuesta de carga de imagen de ayuda.
/// </summary>
public record HelpImageUploadResponse
{
    /// <summary>
    /// Identificador único de la imagen.
    /// </summary>
    public int Id { get; init; }

    /// <summary>
    /// Nombre original del archivo cargado.
    /// </summary>
    public string NombreOriginal { get; init; } = string.Empty;

    /// <summary>
    /// Nombre generado para almacenamiento (GUID con extensión).
    /// </summary>
    public string NombreArchivo { get; init; } = string.Empty;

    /// <summary>
    /// Ruta relativa de acceso a la imagen (ej: /api/media/help/2025/03/abc-123.png).
    /// </summary>
    public string RutaRelativa { get; init; } = string.Empty;

    /// <summary>
    /// Tamaño del archivo en bytes.
    /// </summary>
    public long TamanhoBytes { get; init; }

    /// <summary>
    /// Tipo MIME del archivo (ej: image/png, image/jpeg).
    /// </summary>
    public string MimeType { get; init; } = string.Empty;

    /// <summary>
    /// Ancho de la imagen en píxeles (opcional).
    /// </summary>
    public int? Ancho { get; init; }

    /// <summary>
    /// Alto de la imagen en píxeles (opcional).
    /// </summary>
    public int? Alto { get; init; }

    /// <summary>
    /// Fecha y hora de la carga.
    /// </summary>
    public DateTime FechaSubida { get; init; }
}
