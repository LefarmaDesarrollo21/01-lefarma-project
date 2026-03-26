using System.ComponentModel.DataAnnotations;

namespace Lefarma.API.Features.Help.DTOs;

public class CreateHelpModuleRequest
{
    [Required(ErrorMessage = "El nombre del módulo es requerido")]
    [StringLength(50, ErrorMessage = "El nombre no puede exceder 50 caracteres")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El label del módulo es requerido")]
    [StringLength(100, ErrorMessage = "El label no puede exceder 100 caracteres")]
    public string Label { get; set; } = string.Empty;

    public int Orden { get; set; } = 0;
}
