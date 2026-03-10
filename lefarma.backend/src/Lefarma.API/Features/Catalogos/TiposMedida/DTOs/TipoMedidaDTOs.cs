namespace Lefarma.API.Features.Catalogos.TiposMedida.DTOs
{
    public class TipoMedidaResponse
    {
        public int IdTipoMedida { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }

    public class CreateTipoMedidaRequest
    {
        public required string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public bool Activo { get; set; } = true;
    }

    public class UpdateTipoMedidaRequest
    {
        public required int IdTipoMedida { get; set; }
        public required string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public bool Activo { get; set; }
    }
}
