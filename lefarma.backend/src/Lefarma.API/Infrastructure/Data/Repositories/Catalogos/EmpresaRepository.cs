using Microsoft.EntityFrameworkCore;
using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;

namespace Lefarma.API.Infrastructure.Data.Repositories.Catalogos {
    // @lat: [[backend#Infrastructure]]
    public class EmpresaRepository : BaseRepository<Empresa>, IEmpresaRepository
    {
        private readonly ApplicationDbContext _context;

        public EmpresaRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
