using ErrorOr;
using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;
using Lefarma.API.Features.Catalogos.TipoGastos.DTOs;
using Lefarma.API.Infrastructure.Data.Repositories;
using Lefarma.API.Shared.Errors;
using Lefarma.API.Shared.Extensions;
using Lefarma.API.Shared.Logging;
using Lefarma.API.Shared.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lefarma.API.Features.Catalogos.TipoGastos
{
    public class TipoGastoService : BaseService, ITipoGastoService
    {
        private readonly ITipoGastoRepository _tipoGastoRepository;
        private readonly ILogger<TipoGastoService> _logger;
        protected override string EntityName => "TipoGasto";

        public TipoGastoService(ITipoGastoRepository tipoGastoRepository,
            IWideEventAccessor wideEventAccessor, 
            ILogger<TipoGastoService> logger) 
            : base(wideEventAccessor)
        {
            _tipoGastoRepository = tipoGastoRepository;
            _logger = logger;
        }

        public async Task<ErrorOr<IEnumerable<TipoGastoResponse>>> GetAllAsync()
        {
            try
            {
                var result = await _tipoGastoRepository.GetAllAsync();
                if (result == null || !result.Any())
                {
                    EnrichWideEvent(action: "GetAll", count: 0);
                    return CommonErrors.NotFound("Tipos de gasto");
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
                return CommonErrors.DatabaseError("obtener los tipos de gasto");
            }
        }

        public async Task<ErrorOr<TipoGastoResponse>> GetByIdAsync(int id)
        {
            try
            {
                var result = await _tipoGastoRepository.GetByIdAsync(id);
                if (result == null)
                {
                    EnrichWideEvent(action: "GetById", entityId: id, notFound: true);
                    return CommonErrors.NotFound("tipo de gasto", id.ToString());
                }

                var response = result.ToResponse();
                EnrichWideEvent(action: "GetById", entityId: id, nombre: response.Nombre);
                return response;
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "GetById", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"obtener el tipo de gasto");
            }
        }

        public async Task<ErrorOr<TipoGastoResponse>> CreateAsync(CreateTipoGastoRequest request)
        {
            try
            {
                var existeConcepto = await _tipoGastoRepository.ExistsAsync(s => s.Concepto == request.Concepto);
                if (existeConcepto)
                {
                    EnrichWideEvent(action: "Create", nombre: request.Concepto, duplicate: true);
                    return CommonErrors.AlreadyExists("tipo de gasto", "concepto", request.Concepto);
                }

                var tipoGasto = new TipoGasto
                {
                    Nombre = request.Nombre,
                    NombreNormalizado = StringExtensions.RemoveDiacritics(request.Nombre),
                    Descripcion = request.Descripcion,
                    DescripcionNormalizada = StringExtensions.RemoveDiacritics(request.Descripcion),
                    Clave = request.Clave,
                    Concepto = request.Concepto,
                    Cuenta = request.Cuenta,
                    SubCuenta = request.SubCuenta,
                    Analitica = request.Analitica,
                    Integracion = request.Integracion,
                    RequiereComprobacionPago = request.RequiereComprobacionPago,
                    RequiereComprobacionGasto = request.RequiereComprobacionGasto,
                    PermiteSinDatosFiscales = request.PermiteSinDatosFiscales,
                    DiasLimiteComprobacion = request.DiasLimiteComprobacion ?? 0,
                    Activo = request.Activo,
                    FechaCreacion = DateTime.UtcNow,
                    CuentaCatalogo = $"{request.Cuenta}-{request.SubCuenta}-{request.Analitica}-{request.Integracion}"
                };

                var result = await _tipoGastoRepository.AddAsync(tipoGasto);
                EnrichWideEvent(action: "Create", entityId: result.IdTipoGasto, nombre: result.Nombre);
                return result.ToResponse();
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Create", nombre: request.Nombre, error: ex.Message);
                return CommonErrors.DatabaseError($"guardar el tipo de gasto");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Create", nombre: request.Nombre, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al crear el tipo de gasto.");
            }
        }

        public async Task<ErrorOr<TipoGastoResponse>> UpdateAsync(int id, UpdateTipoGastoRequest request)
        {
            try
            {
                var tipoGasto = await _tipoGastoRepository.GetByIdAsync(id);
                if (tipoGasto == null)
                {
                    EnrichWideEvent(action: "Update", entityId: id, notFound: true);
                    return CommonErrors.NotFound("tipo de gasto", id.ToString());
                }

                var existeConcepto = await _tipoGastoRepository.ExistsAsync(s => s.Concepto == request.Concepto && s.IdTipoGasto != id);
                if (existeConcepto)
                {
                    EnrichWideEvent(action: "Update", entityId: id, nombre: request.Concepto, duplicate: true);
                    return CommonErrors.AlreadyExists("tipo de gasto", "concepto", request.Concepto);
                }

                tipoGasto.Nombre = request.Nombre;
                tipoGasto.Descripcion = request.Descripcion;
                tipoGasto.Clave = request.Clave;
                tipoGasto.Concepto = request.Concepto;
                tipoGasto.Cuenta = request.Cuenta;
                tipoGasto.SubCuenta = request.SubCuenta;
                tipoGasto.Analitica = request.Analitica;
                tipoGasto.Integracion = request.Integracion;
                tipoGasto.RequiereComprobacionPago = request.RequiereComprobacionPago;
                tipoGasto.RequiereComprobacionGasto = request.RequiereComprobacionGasto;
                tipoGasto.PermiteSinDatosFiscales = request.PermiteSinDatosFiscales;
                tipoGasto.DiasLimiteComprobacion = request.DiasLimiteComprobacion ?? 0;
                tipoGasto.Activo = request.Activo;
                tipoGasto.FechaModificacion = DateTime.UtcNow;
                tipoGasto.CuentaCatalogo = $"{tipoGasto.Cuenta}-{tipoGasto.SubCuenta}-{tipoGasto.Analitica}-{tipoGasto.Integracion}";

                var result = await _tipoGastoRepository.UpdateAsync(tipoGasto);
                EnrichWideEvent(action: "Update", entityId: id, nombre: result.Nombre);
                return result.ToResponse();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.ConcurrencyError("tipo de gasto");
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"actualizar el tipo de gasto");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al actualizar el tipo de gasto.");
            }
        }

        public async Task<ErrorOr<bool>> DeleteAsync(int id)
        {
            try
            {
                var tipoGasto = await _tipoGastoRepository.GetByIdAsync(id);
                if (tipoGasto == null)
                {
                    EnrichWideEvent(action: "Delete", entityId: id, notFound: true);
                    return CommonErrors.NotFound("tipo de gasto", id.ToString());
                }

                var eliminado = await _tipoGastoRepository.DeleteAsync(tipoGasto);
                if (!eliminado)
                {
                    EnrichWideEvent(action: "Delete", entityId: id, deleteFailed: true);
                    return CommonErrors.DeleteFailed("tipo de gasto");
                }

                EnrichWideEvent(action: "Delete", entityId: id, nombre: tipoGasto.Nombre);
                return true;
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Delete", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"eliminar el tipo de gasto");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Delete", entityId: id, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al eliminar el tipo de gasto.");
            }
        }    
    }
}
