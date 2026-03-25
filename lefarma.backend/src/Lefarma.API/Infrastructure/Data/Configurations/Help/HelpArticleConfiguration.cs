using Lefarma.API.Domain.Entities.Help;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Help;

public class HelpArticleConfiguration : IEntityTypeConfiguration<HelpArticle>
{
    public void Configure(EntityTypeBuilder<HelpArticle> builder)
    {
        builder.ToTable("HelpArticles", schema: "help");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Titulo)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Contenido)
            .IsRequired();

        builder.Property(x => x.Resumen)
            .HasMaxLength(500);

        builder.Property(x => x.Modulo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Categoria)
            .HasMaxLength(100);

        builder.Property(x => x.Orden)
            .HasDefaultValue(0);

        builder.Property(x => x.Activo)
            .HasDefaultValue(true);

        builder.Property(x => x.FechaCreacion)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.FechaActualizacion)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreadoPor)
            .HasMaxLength(100);

        builder.Property(x => x.ActualizadoPor)
            .HasMaxLength(100);

        // Índices para búsquedas frecuentes
        builder.HasIndex(x => new { x.Modulo, x.Activo })
            .HasDatabaseName("IX_HelpArticles_Modulo_Activo");

        builder.HasIndex(x => new { x.Tipo, x.Activo })
            .HasDatabaseName("IX_HelpArticles_Tipo_Activo");

        builder.HasIndex(x => x.Categoria)
            .HasDatabaseName("IX_HelpArticles_Categoria_Activo");
    }
}
