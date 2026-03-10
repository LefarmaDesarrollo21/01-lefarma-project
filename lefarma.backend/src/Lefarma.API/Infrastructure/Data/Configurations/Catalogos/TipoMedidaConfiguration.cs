using Lefarma.API.Domain.Entities.Catalogos;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Catalogos
{
    public class TipoMedidaConfiguration : IEntityTypeConfiguration<TipoMedida>
    {
        public void Configure(EntityTypeBuilder<TipoMedida> builder)
        {
            builder.ToTable("tipos_medida", "catalogos");

            builder.HasKey(t => t.IdTipoMedida);

            builder.Property(t => t.IdTipoMedida)
                .HasColumnName("id_tipo_medida")
                .UseIdentityColumn(1, 1);

            builder.Property(t => t.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(80)
                .IsRequired();

            builder.Property(t => t.NombreNormalizado)
                .HasColumnName("nombre_normalizado")
                .HasMaxLength(80);

            builder.Property(t => t.Descripcion)
                .HasColumnName("descripcion")
                .HasMaxLength(255);

            builder.Property(t => t.DescripcionNormalizada)
                .HasColumnName("descripcion_normalizada")
                .HasMaxLength(255);

            builder.Property(t => t.Activo)
                .HasColumnName("activo")
                .HasDefaultValue(true);

            builder.Property(t => t.FechaCreacion)
                .HasColumnName("fecha_creacion")
                .HasDefaultValueSql("GETDATE()")
                .IsRequired();

            builder.Property(t => t.FechaModificacion)
                .HasColumnName("fecha_modificacion")
                .HasDefaultValueSql("GETDATE()");

            // Relaciones
            builder.HasMany(e => e.UnidadMedidas)
                .WithOne(s => s.TipoMedida)
                .HasForeignKey(s => s.IdTipoMedida)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
