namespace Lefarma.API.Features.Archivos.DTOs;

// @lat: [[backend#Features]]

public record ListarArchivosQuery
{
    public string? EntidadTipo { get; init; }
    public int? EntidadId { get; init; }
    public bool SoloActivos { get; init; } = true;
}
