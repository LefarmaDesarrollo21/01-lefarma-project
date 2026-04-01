using Lefarma.API.Domain.Entities.Catalogos;

namespace Lefarma.API.Domain.Interfaces.Catalogos {
    // @lat: [[backend#Domain]]
    public interface IUnidadMedidaRepository : IBaseRepository<UnidadMedida>
    {
        Task ActualizarActivosAsync(int idMedida, List<int> idsUnidadesActivas);
    }
}
