using Lefarma.API.Domain.Entities.Help;
using Lefarma.API.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Infrastructure.Data.Repositories;

/// <summary>
/// Repositorio para operaciones de imágenes de ayuda.
/// </summary>
public class HelpImageRepository : IHelpImageRepository
{
    private readonly ApplicationDbContext _context;

    public HelpImageRepository(ApplicationDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    /// <summary>
    /// Crea un nuevo registro de imagen de ayuda en la base de datos.
    /// </summary>
    public async Task<HelpImage> CreateAsync(HelpImage helpImage, CancellationToken ct)
    {
        await _context.HelpImages.AddAsync(helpImage, ct);
        await _context.SaveChangesAsync(ct);
        return helpImage;
    }

    /// <summary>
    /// Obtiene una imagen de ayuda por su nombre de archivo.
    /// </summary>
    public async Task<HelpImage?> GetByFileNameAsync(string nombreArchivo, CancellationToken ct)
    {
        return await _context.HelpImages
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.NombreArchivo == nombreArchivo, ct);
    }
}
