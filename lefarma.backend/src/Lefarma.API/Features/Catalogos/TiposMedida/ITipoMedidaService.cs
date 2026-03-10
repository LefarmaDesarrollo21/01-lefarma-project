using ErrorOr;
using Lefarma.API.Features.Catalogos.TiposMedida.DTOs;

namespace Lefarma.API.Features.Catalogos.TiposMedida
{
    public interface ITipoMedidaService
    {
        Task<ErrorOr<IEnumerable<TipoMedidaResponse>>> GetAllAsync();
        Task<ErrorOr<TipoMedidaResponse>> GetByIdAsync(int id);
        Task<ErrorOr<TipoMedidaResponse>> CreateAsync(CreateTipoMedidaRequest request);
        Task<ErrorOr<TipoMedidaResponse>> UpdateAsync(int id, UpdateTipoMedidaRequest request);
        Task<ErrorOr<bool>> DeleteAsync(int id);
    }
}
