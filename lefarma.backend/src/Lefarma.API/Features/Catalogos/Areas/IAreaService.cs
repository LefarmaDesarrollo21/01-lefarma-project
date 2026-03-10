using ErrorOr;
using Lefarma.API.Features.Catalogos.Areas.DTOs;

namespace Lefarma.API.Features.Catalogos.Areas
{
    public interface IAreaService
    {
        Task<ErrorOr<IEnumerable<AreaResponse>>> GetAllAsync();
        Task<ErrorOr<AreaResponse>> GetByIdAsync(int id);
        Task<ErrorOr<AreaResponse>> CreateAsync(CreateAreaRequest request);
        Task<ErrorOr<AreaResponse>> UpdateAsync(int id, UpdateAreaRequest request);
        Task<ErrorOr<bool>> DeleteAsync(int id);
    }
}
