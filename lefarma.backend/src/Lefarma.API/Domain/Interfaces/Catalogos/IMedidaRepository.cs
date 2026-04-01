using Lefarma.API.Domain.Entities.Catalogos;

namespace Lefarma.API.Domain.Interfaces.Catalogos {
    // @lat: [[backend#Domain]]
    public interface IMedidaRepository : IBaseRepository<Medida>
    {
        Task<ICollection<Medida>> GetAllConUnidadesAsync();
    }
}
