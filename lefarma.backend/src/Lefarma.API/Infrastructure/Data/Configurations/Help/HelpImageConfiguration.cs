using Lefarma.API.Domain.Entities.Help;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Help;

public class HelpImageConfiguration : IEntityTypeConfiguration<HelpImage>
{
    public void Configure(EntityTypeBuilder<HelpImage> builder)
    {
        builder.ToTable("HelpImages", schema: "help");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("Id")
            .ValueGeneratedOnAdd();

        builder.Property(x => x.NombreOriginal)
            .HasColumnName("NombreOriginal")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.NombreArchivo)
            .HasColumnName("NombreArchivo")
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(x => x.RutaRelativa)
            .HasColumnName("RutaRelativa")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.TamanhoBytes)
            .HasColumnName("TamanhoBytes")
            .IsRequired();

        builder.Property(x => x.MimeType)
            .HasColumnName("MimeType")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Ancho)
            .HasColumnName("Ancho")
            .IsRequired(false);

        builder.Property(x => x.Alto)
            .HasColumnName("Alto")
            .IsRequired(false);

        builder.Property(x => x.FechaSubida)
            .HasColumnName("FechaSubida")
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(x => x.SubidoPor)
            .HasColumnName("SubidoPor")
            .HasMaxLength(100);

        // Índices
        builder.HasIndex(x => x.NombreArchivo)
            .HasDatabaseName("IX_HelpImages_NombreArchivo");

        builder.HasIndex(x => x.FechaSubida)
            .IsDescending()
            .HasDatabaseName("IX_HelpImages_FechaSubida");
    }
}
