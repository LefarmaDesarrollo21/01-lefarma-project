using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;
using Lefarma.API.Domain.Interfaces;

namespace Lefarma.API.Infrastructure.Data.Repositories.Catalogos {
    // @lat: [[backend#Infrastructure]]
    public class CentroCostoRepository : BaseRepository<CentroCosto>, ICentroCostoRepository
    {
        private readonly ApplicationDbContext _context;

        public CentroCostoRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
