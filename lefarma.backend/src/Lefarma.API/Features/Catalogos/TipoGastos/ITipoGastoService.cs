using ErrorOr;
using Lefarma.API.Features.Catalogos.TipoGastos.DTOs;

namespace Lefarma.API.Features.Catalogos.TipoGastos
{
    public interface ITipoGastoService
    {
        Task<ErrorOr<IEnumerable<TipoGastoResponse>>> GetAllAsync();
        Task<ErrorOr<TipoGastoResponse>> GetByIdAsync(int id);
        Task<ErrorOr<TipoGastoResponse>> CreateAsync(CreateTipoGastoRequest request);
        Task<ErrorOr<TipoGastoResponse>> UpdateAsync(int id, UpdateTipoGastoRequest request);
        Task<ErrorOr<bool>> DeleteAsync(int id);
    }
}
