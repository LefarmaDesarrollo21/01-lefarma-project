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
            .HasColumnName("Id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.Titulo)
            .HasColumnName("Titulo")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(x => x.Contenido)
            .HasColumnName("Contenido")
            .IsRequired();

        builder.Property(x => x.Resumen)
            .HasColumnName("Resumen")
            .HasMaxLength(500);

        builder.Property(x => x.Modulo)
            .HasColumnName("Modulo")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Tipo)
            .HasColumnName("Tipo")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Categoria)
            .HasColumnName("Categoria")
            .HasMaxLength(100);

        builder.Property(x => x.Orden)
            .HasColumnName("Orden")
            .HasDefaultValue(0);

        builder.Property(x => x.Activo)
            .HasColumnName("Activo")
            .HasDefaultValue(true);

        builder.Property(x => x.FechaCreacion)
            .HasColumnName("FechaCreacion")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.FechaActualizacion)
            .HasColumnName("FechaActualizacion")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.CreadoPor)
            .HasColumnName("CreadoPor")
            .HasMaxLength(100);

        builder.Property(x => x.ActualizadoPor)
            .HasColumnName("ActualizadoPor")
            .HasMaxLength(100);

        // Índices para búsquedas frecuentes
        builder.HasIndex(x => new { x.Modulo, x.Activo })
            .HasDatabaseName("IX_HelpArticles_Modulo_Activo");

        builder.HasIndex(x => new { x.Tipo, x.Activo })
            .HasDatabaseName("IX_HelpArticles_Tipo_Activo");

        builder.HasIndex(x => new { x.Categoria, x.Activo })
            .HasDatabaseName("IX_HelpArticles_Categoria_Activo")
            .HasFilter("[Categoria] IS NOT NULL");
    }
}
