using Azure;
using ErrorOr;
using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;
using Lefarma.API.Features.Catalogos.Sucursales.DTOs;
using Lefarma.API.Infrastructure.Data.Repositories;
using Lefarma.API.Shared.Errors;
using Lefarma.API.Shared.Extensions;
using Lefarma.API.Shared.Logging;
using Lefarma.API.Shared.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lefarma.API.Features.Catalogos.Sucursales
{
    public class SucursalService : BaseService, ISucursalService
    {
        private readonly ISucursalRepository _sucursalRepository;
        private readonly IEmpresaRepository _empresaRepository;
        private readonly ILogger<SucursalService> _logger;
        protected override string EntityName => "Sucursal";

        public SucursalService(
            ISucursalRepository sucursalRepository,
            IEmpresaRepository empresaRepository,
            IWideEventAccessor wideEventAccessor,
            ILogger<SucursalService> logger)
            : base(wideEventAccessor)
        {
            _sucursalRepository = sucursalRepository;
            _empresaRepository = empresaRepository;
            _logger = logger;
        }

        public async Task<ErrorOr<IEnumerable<SucursalResponse>>> GetAllAsync()
        {
            try
            {
                var result = await _sucursalRepository.GetAllAsync();
                if (result == null || !result.Any())
                {
                    EnrichWideEvent(action: "GetAll", count: 0);
                    return CommonErrors.NotFound("Sucursales");
                }

                var response = result
                    .Where(e => !string.IsNullOrWhiteSpace(e.Nombre))
                    .Select(e => e.ToResponse())
                    .OrderBy(e => e.Nombre)
                    .ToList();

                EnrichWideEvent(action: "GetAll", count: response.Count, items: response.Select(e => e.Nombre).ToList());
                return response;
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "GetAll", error: ex.Message);
                return CommonErrors.DatabaseError("obtener las sucursales");
            }
        }

        public async Task<ErrorOr<SucursalResponse>> GetByIdAsync(int id)
        {
            try
            {
                var result = await _sucursalRepository.GetByIdAsync(id);
                if (result == null)
                {
                    EnrichWideEvent(action: "GetById", entityId: id, notFound: true);
                    return CommonErrors.NotFound("sucursal", id.ToString());
                }

                var response = result.ToResponse();
                EnrichWideEvent(action: "GetById", entityId: id, nombre: response.Nombre);
                return response;
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "GetById", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"obtener la sucursal");
            }
        }

        public async Task<ErrorOr<SucursalResponse>> CreateAsync(CreateSucursalRequest request)
        {
            try
            {
                var empresaExiste = await _empresaRepository.ExistsAsync(e => e.IdEmpresa == request.IdEmpresa);
                if (!empresaExiste)
                {
                    EnrichWideEvent(action: "Create", entityId: request.IdEmpresa, notFound: true);
                    return CommonErrors.NotFound("empresa", request.IdEmpresa.ToString());
                }

                var existeNombre = await _sucursalRepository.ExistsAsync(s => s.Nombre == request.Nombre);
                if (existeNombre)
                {
                    EnrichWideEvent(action: "Create", nombre: request.Nombre, duplicate: true);
                    return CommonErrors.AlreadyExists("sucursal", "nombre", request.Nombre);
                }

                var sucursal = new Sucursal
                {
                    IdEmpresa = request.IdEmpresa,
                    Nombre = request.Nombre.Trim(),
                    NombreNormalizado = StringExtensions.RemoveDiacritics(request.Nombre),
                    Descripcion = request.Descripcion,
                    DescripcionNormalizada = StringExtensions.RemoveDiacritics(request.Descripcion),
                    Clave = request.Clave,
                    ClaveContable = request.ClaveContable,
                    Direccion = request.Direccion,
                    CodigoPostal = request.CodigoPostal,
                    Ciudad = request.Ciudad,
                    Estado = request.Estado,
                    Telefono = request.Telefono,
                    Latitud = request.Latitud,
                    Longitud = request.Longitud,
                    NumeroEmpleados = request.NumeroEmpleados ?? 0,
                    Activo = request.Activo,
                    FechaCreacion = DateTime.UtcNow
                };

                var result = await _sucursalRepository.AddAsync(sucursal);
                EnrichWideEvent(action: "Create", entityId: result.IdSucursal, nombre: result.Nombre);
                return result.ToResponse();
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Create", nombre: request.Nombre, error: ex.Message);
                return CommonErrors.DatabaseError($"guardar la sucursal");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Create", nombre: request.Nombre, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al crear la sucursal.");
            }
        }

        public async Task<ErrorOr<SucursalResponse>> UpdateAsync(int id, UpdateSucursalRequest request)
        {
            try
            {
                var empresaExiste = await _empresaRepository.ExistsAsync(e => e.IdEmpresa == request.IdEmpresa);
                if (!empresaExiste)
                {
                    EnrichWideEvent(action: "Update", entityId: request.IdEmpresa, notFound: true);
                    return CommonErrors.NotFound("empresa", request.IdEmpresa.ToString());
                }

                var sucursal = await _sucursalRepository.GetByIdAsync(id);
                if (sucursal == null)
                {
                    EnrichWideEvent(action: "Update", entityId: id, notFound: true);
                    return CommonErrors.NotFound("sucursal", id.ToString());
                }

                var existeNombre = await _sucursalRepository.ExistsAsync(s => s.Nombre == request.Nombre && s.IdSucursal != id);
                if (existeNombre)
                {
                    EnrichWideEvent(action: "Update", entityId: id, nombre: request.Nombre, duplicate: true);
                    return CommonErrors.AlreadyExists("sucursal", "nombre", request.Nombre);
                }

                sucursal.Nombre = request.Nombre.Trim();
                sucursal.NombreNormalizado = StringExtensions.RemoveDiacritics(request.Nombre);
                sucursal.Descripcion = request.Descripcion;
                sucursal.DescripcionNormalizada = StringExtensions.RemoveDiacritics(request.Descripcion);
                sucursal.Clave = request.Clave;
                sucursal.ClaveContable = request.ClaveContable;
                sucursal.Direccion = request.Direccion;
                sucursal.CodigoPostal = request.CodigoPostal;
                sucursal.Ciudad = request.Ciudad;
                sucursal.Estado = request.Estado;
                sucursal.Telefono = request.Telefono;
                sucursal.Latitud = request.Latitud;
                sucursal.Longitud = request.Longitud;
                sucursal.NumeroEmpleados = request.NumeroEmpleados ?? 0;
                sucursal.Activo = request.Activo;
                sucursal.FechaModificacion = DateTime.UtcNow;

                var result = await _sucursalRepository.UpdateAsync(sucursal);
                EnrichWideEvent(action: "Update", entityId: id, nombre: result.Nombre);
                return result.ToResponse();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.ConcurrencyError("sucursal");
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"actualizar la sucursal");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al actualizar la sucursal.");
            }
        }

        public async Task<ErrorOr<bool>> DeleteAsync(int id)
        {
            try
            {
                var sucursal = await _sucursalRepository.GetByIdAsync(id);
                if (sucursal == null)
                {
                    EnrichWideEvent(action: "Delete", entityId: id, notFound: true);
                    return CommonErrors.NotFound("sucursal", id.ToString());
                }

                var eliminado = await _sucursalRepository.DeleteAsync(sucursal);
                if (!eliminado)
                {
                    EnrichWideEvent(action: "Delete", entityId: id, deleteFailed: true);
                    return CommonErrors.DeleteFailed("sucursal");
                }

                EnrichWideEvent(action: "Delete", entityId: id, nombre: sucursal.Nombre);
                return true;
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Delete", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"eliminar la sucursal");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Delete", entityId: id, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al eliminar la sucursal.");
            }
        }

        
    }
}
