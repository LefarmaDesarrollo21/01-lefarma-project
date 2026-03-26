namespace Lefarma.API.Features.Help.DTOs;

public class HelpModuleDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public int Orden { get; set; }
    public bool Activo { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime FechaActualizacion { get; set; }
}
