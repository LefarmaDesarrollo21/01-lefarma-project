using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Features.Catalogos.Areas.DTOs;
using Lefarma.API.Features.Catalogos.Empresas.DTOs;
using Lefarma.API.Features.Catalogos.Sucursales.DTOs;
using Lefarma.API.Features.Catalogos.TiposMedida.DTOs;
using Lefarma.API.Features.Catalogos.TipoGastos.DTOs;
using Lefarma.API.Features.Catalogos.UnidadesMedida.DTOs;

namespace Lefarma.API.Shared.Extensions
{
    /// <summary>
    /// Métodos de extensión para mapeo de entidades a DTOs de respuesta.
    /// </summary>
    public static class EntityMappings
    {
        #region Empresa Mappings

        public static EmpresaResponse ToResponse(this Empresa entity) => new()
        {
            IdEmpresa = entity.IdEmpresa,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion ?? string.Empty,
            Clave = entity.Clave ?? string.Empty,
            RazonSocial = entity.RazonSocial ?? string.Empty,
            RFC = entity.RFC ?? string.Empty,
            Direccion = entity.Direccion ?? string.Empty,
            Colonia = entity.Colonia ?? string.Empty,
            Ciudad = entity.Ciudad ?? string.Empty,
            Estado = entity.Estado ?? string.Empty,
            CodigoPostal = entity.CodigoPostal ?? string.Empty,
            Telefono = entity.Telefono ?? string.Empty,
            Email = entity.Email ?? string.Empty,
            PaginaWeb = entity.PaginaWeb ?? string.Empty,
            NumeroEmpleados = entity.NumeroEmpleados ?? 0,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion
        };

        #endregion

        #region Sucursal Mappings

        public static SucursalResponse ToResponse(this Sucursal entity) => new()
        {
            IdSucursal = entity.IdSucursal,
            IdEmpresa = entity.IdEmpresa,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion ?? string.Empty,
            Clave = entity.Clave ?? string.Empty,
            ClaveContable = entity.ClaveContable ?? string.Empty,
            Direccion = entity.Direccion ?? string.Empty,
            CodigoPostal = entity.CodigoPostal ?? string.Empty,
            Ciudad = entity.Ciudad ?? string.Empty,
            Estado = entity.Estado ?? string.Empty,
            Telefono = entity.Telefono ?? string.Empty,
            Latitud = entity.Latitud,
            Longitud = entity.Longitud,
            NumeroEmpleados = entity.NumeroEmpleados,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion
        };

        #endregion

        #region TipoGasto Mappings

        public static TipoGastoResponse ToResponse(this TipoGasto entity) => new()
        {
            IdTipoGasto = entity.IdTipoGasto,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion ?? string.Empty,
            Clave = entity.Clave ?? string.Empty,
            Concepto = entity.Concepto ?? string.Empty,
            Cuenta = entity.Cuenta ?? string.Empty,
            SubCuenta = entity.SubCuenta ?? string.Empty,
            Analitica = entity.Analitica ?? string.Empty,
            Integracion = entity.Integracion ?? string.Empty,
            CuentaCatalogo = entity.CuentaCatalogo ?? string.Empty,
            RequiereComprobacionPago = entity.RequiereComprobacionPago,
            RequiereComprobacionGasto = entity.RequiereComprobacionGasto,
            PermiteSinDatosFiscales = entity.PermiteSinDatosFiscales,
            DiasLimiteComprobacion = entity.DiasLimiteComprobacion,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion
        };

        #endregion

        #region Area Mappings

        public static AreaResponse ToResponse(this Area entity) => new()
        {
            IdArea = entity.IdArea,
            IdEmpresa = entity.IdEmpresa,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion ?? string.Empty,
            Clave = entity.Clave ?? string.Empty,
            NumeroEmpleados = entity.NumeroEmpleados,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion
        };

        #endregion

        #region TipoMedida Mappings

        public static TipoMedidaResponse ToResponse(this TipoMedida entity) => new()
        {
            IdTipoMedida = entity.IdTipoMedida,
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion ?? string.Empty,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion
        };

        #endregion

        #region UnidadMedida Mappings

        public static UnidadMedidaResponse ToResponse(this UnidadMedida entity) => new()
        {
            IdUnidadMedida = entity.IdUnidadMedida,
            IdTipoMedida = entity.IdTipoMedida,
            NombreTipoMedida = null, // Navegación no incluida para evitar carga
            Nombre = entity.Nombre,
            Descripcion = entity.Descripcion ?? string.Empty,
            Abreviatura = entity.Abreviatura,
            Activo = entity.Activo,
            FechaCreacion = entity.FechaCreacion,
            FechaModificacion = entity.FechaModificacion
        };

        #endregion
    }
}
