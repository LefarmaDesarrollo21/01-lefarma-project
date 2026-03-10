using ErrorOr;
using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;
using Lefarma.API.Features.Catalogos.TiposMedida.DTOs;
using Lefarma.API.Shared.Errors;
using Lefarma.API.Shared.Extensions;
using Lefarma.API.Shared.Logging;
using Lefarma.API.Shared.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lefarma.API.Features.Catalogos.TiposMedida
{
    public class TipoMedidaService : BaseService, ITipoMedidaService
    {
        private readonly ITipoMedidaRepository _tipoMedidaRepository;
        private readonly ILogger<TipoMedidaService> _logger;
        protected override string EntityName => "TipoMedida";

        public TipoMedidaService(
            ITipoMedidaRepository tipoMedidaRepository,
            IWideEventAccessor wideEventAccessor,
            ILogger<TipoMedidaService> logger)
            : base(wideEventAccessor)
        {
            _tipoMedidaRepository = tipoMedidaRepository;
            _logger = logger;
        }

        public async Task<ErrorOr<IEnumerable<TipoMedidaResponse>>> GetAllAsync()
        {
            try
            {
                var result = await _tipoMedidaRepository.GetAllAsync();
                if (result == null || !result.Any())
                {
                    EnrichWideEvent(action: "GetAll", count: 0);
                    return CommonErrors.NotFound("Tipos de medida");
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
                return CommonErrors.DatabaseError("obtener los tipos de medida");
            }
        }

        public async Task<ErrorOr<TipoMedidaResponse>> GetByIdAsync(int id)
        {
            try
            {
                var result = await _tipoMedidaRepository.GetByIdAsync(id);
                if (result == null)
                {
                    EnrichWideEvent(action: "GetById", entityId: id, notFound: true);
                    return CommonErrors.NotFound("tipo de medida", id.ToString());
                }

                var response = result.ToResponse();
                EnrichWideEvent(action: "GetById", entityId: id, nombre: response.Nombre);
                return response;
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "GetById", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"obtener el tipo de medida");
            }
        }

        public async Task<ErrorOr<TipoMedidaResponse>> CreateAsync(CreateTipoMedidaRequest request)
        {
            try
            {
                var existeNombre = await _tipoMedidaRepository.ExistsAsync(t => t.Nombre == request.Nombre);
                if (existeNombre)
                {
                    EnrichWideEvent(action: "Create", nombre: request.Nombre, duplicate: true);
                    return CommonErrors.AlreadyExists("tipo de medida", "nombre", request.Nombre);
                }

                var tipoMedida = new TipoMedida
                {
                    Nombre = request.Nombre.Trim(),
                    NombreNormalizado = StringExtensions.RemoveDiacritics(request.Nombre),
                    Descripcion = request.Descripcion,
                    DescripcionNormalizada = StringExtensions.RemoveDiacritics(request.Descripcion),
                    Activo = request.Activo,
                    FechaCreacion = DateTime.UtcNow
                };

                var result = await _tipoMedidaRepository.AddAsync(tipoMedida);
                EnrichWideEvent(action: "Create", entityId: result.IdTipoMedida, nombre: result.Nombre);
                return result.ToResponse();
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Create", nombre: request.Nombre, error: ex.Message);
                return CommonErrors.DatabaseError($"guardar el tipo de medida");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Create", nombre: request.Nombre, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al crear el tipo de medida.");
            }
        }

        public async Task<ErrorOr<TipoMedidaResponse>> UpdateAsync(int id, UpdateTipoMedidaRequest request)
        {
            try
            {
                var tipoMedida = await _tipoMedidaRepository.GetByIdAsync(id);
                if (tipoMedida == null)
                {
                    EnrichWideEvent(action: "Update", entityId: id, notFound: true);
                    return CommonErrors.NotFound("tipo de medida", id.ToString());
                }

                var existeNombre = await _tipoMedidaRepository.ExistsAsync(t => t.Nombre == request.Nombre && t.IdTipoMedida != id);
                if (existeNombre)
                {
                    EnrichWideEvent(action: "Update", entityId: id, nombre: request.Nombre, duplicate: true);
                    return CommonErrors.AlreadyExists("tipo de medida", "nombre", request.Nombre);
                }

                tipoMedida.Nombre = request.Nombre.Trim();
                tipoMedida.NombreNormalizado = StringExtensions.RemoveDiacritics(request.Nombre);
                tipoMedida.Descripcion = request.Descripcion;
                tipoMedida.DescripcionNormalizada = StringExtensions.RemoveDiacritics(request.Descripcion);
                tipoMedida.Activo = request.Activo;
                tipoMedida.FechaModificacion = DateTime.UtcNow;

                var result = await _tipoMedidaRepository.UpdateAsync(tipoMedida);
                EnrichWideEvent(action: "Update", entityId: id, nombre: result.Nombre);
                return result.ToResponse();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.ConcurrencyError("tipo de medida");
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"actualizar el tipo de medida");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Update", entityId: id, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al actualizar el tipo de medida.");
            }
        }

        public async Task<ErrorOr<bool>> DeleteAsync(int id)
        {
            try
            {
                var tipoMedida = await _tipoMedidaRepository.GetByIdAsync(id);
                if (tipoMedida == null)
                {
                    EnrichWideEvent(action: "Delete", entityId: id, notFound: true);
                    return CommonErrors.NotFound("tipo de medida", id.ToString());
                }

                var eliminado = await _tipoMedidaRepository.DeleteAsync(tipoMedida);
                if (!eliminado)
                {
                    EnrichWideEvent(action: "Delete", entityId: id, deleteFailed: true);
                    return CommonErrors.DeleteFailed("tipo de medida");
                }

                EnrichWideEvent(action: "Delete", entityId: id, nombre: tipoMedida.Nombre);
                return true;
            }
            catch (DbUpdateException ex)
            {
                EnrichWideEvent(action: "Delete", entityId: id, error: ex.Message);
                return CommonErrors.DatabaseError($"eliminar el tipo de medida");
            }
            catch (Exception ex)
            {
                EnrichWideEvent(action: "Delete", entityId: id, error: ex.Message);
                return CommonErrors.InternalServerError($"Error inesperado al eliminar el tipo de medida.");
            }
        }
    }
}
