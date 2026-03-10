namespace Lefarma.API.Features.Catalogos.Sucursales.DTOs
{
    public class SucursalResponse
    {
        public int IdSucursal { get; set; }
        public int IdEmpresa { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public string Clave { get; set; } = string.Empty;
        public string ClaveContable { get; set; } = string.Empty;
        public string Direccion { get; set; } = string.Empty;
        public string CodigoPostal { get; set; } = string.Empty;
        public string Ciudad { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public decimal Latitud { get; set; }
        public decimal Longitud { get; set; }
        public int? NumeroEmpleados { get; set; }
        public bool Activo { get; set; }
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaModificacion { get; set; }
    }

    public class CreateSucursalRequest
    {
        public required int IdEmpresa { get; set; }
        public required string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string? Clave { get; set; }
        public string? ClaveContable { get; set; }
        public string? Direccion { get; set; }
        public string? CodigoPostal { get; set; }
        public string? Ciudad { get; set; }
        public string? Estado { get; set; }
        public string? Telefono { get; set; }
        public decimal Latitud { get; set; }
        public decimal Longitud { get; set; }
        public int? NumeroEmpleados { get; set; }
        public bool Activo { get; set; } = true;
    }

    public class UpdateSucursalRequest
    {
        public required int IdSucursal { get; set; }
        public required int IdEmpresa { get; set; }
        public required string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string? Clave { get; set; }
        public string? ClaveContable { get; set; }
        public string? Direccion { get; set; }
        public string? CodigoPostal { get; set; }
        public string? Ciudad { get; set; }
        public string? Estado { get; set; }
        public string? Telefono { get; set; }
        public decimal Latitud { get; set; }
        public decimal Longitud { get; set; }
        public int? NumeroEmpleados { get; set; }
        public bool Activo { get; set; }
    }
}
