using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;

namespace Lefarma.API.Infrastructure.Data.Repositories.Catalogos
{
    public class TipoGastoRepository : BaseRepository<TipoGasto>, ITipoGastoRepository
    {
        private readonly ApplicationDbContext _context;
        public TipoGastoRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
