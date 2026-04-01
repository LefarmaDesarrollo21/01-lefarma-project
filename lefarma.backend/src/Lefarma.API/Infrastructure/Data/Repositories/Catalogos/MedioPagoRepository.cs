using Microsoft.EntityFrameworkCore;
using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Domain.Interfaces.Catalogos;

namespace Lefarma.API.Infrastructure.Data.Repositories.Catalogos {
    // @lat: [[backend#Infrastructure]]
    public class MedioPagoRepository : BaseRepository<MedioPago>, IMedioPagoRepository
    {
        private readonly ApplicationDbContext _context;

        public MedioPagoRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
