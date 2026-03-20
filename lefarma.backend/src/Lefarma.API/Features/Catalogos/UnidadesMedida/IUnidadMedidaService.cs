using ErrorOr;
using Lefarma.API.Features.Catalogos.UnidadesMedida.DTOs;

namespace Lefarma.API.Features.Catalogos.UnidadesMedida
{
    public interface IUnidadMedidaService
    {
        Task<ErrorOr<IEnumerable<UnidadMedidaResponse>>> GetAllAsync(UnidadMedidaRequest query);
        Task<ErrorOr<UnidadMedidaResponse>> GetByIdAsync(int id);
        Task<ErrorOr<UnidadMedidaResponse>> CreateAsync(CreateUnidadMedidaRequest request);
        Task<ErrorOr<UnidadMedidaResponse>> UpdateAsync(int id, UpdateUnidadMedidaRequest request);
        Task<ErrorOr<bool>> DeleteAsync(int id);
    }
}
