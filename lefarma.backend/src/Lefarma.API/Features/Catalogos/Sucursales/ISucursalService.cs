using ErrorOr;
using Lefarma.API.Features.Catalogos.Sucursales.DTOs;

namespace Lefarma.API.Features.Catalogos.Sucursales
{
    public interface ISucursalService
    {
        Task<ErrorOr<IEnumerable<SucursalResponse>>> GetAllAsync();
        Task<ErrorOr<SucursalResponse>> GetByIdAsync(int id);
        Task<ErrorOr<SucursalResponse>> CreateAsync(CreateSucursalRequest request);
        Task<ErrorOr<SucursalResponse>> UpdateAsync(int id, UpdateSucursalRequest request);
        Task<ErrorOr<bool>> DeleteAsync(int id);
    }
}
