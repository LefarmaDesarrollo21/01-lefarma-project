using Lefarma.API.Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Notifications;

public class NotificationChannelConfiguration : IEntityTypeConfiguration<NotificationChannel>
{
    public void Configure(EntityTypeBuilder<NotificationChannel> builder)
    {
        builder.ToTable("NotificationChannels");

        builder.HasKey(nc => nc.Id);
        builder.Property(nc => nc.Id)
            .ValueGeneratedOnAdd();

        // Property mappings
        builder.Property(nc => nc.NotificationId)
            .IsRequired();

        builder.Property(nc => nc.ChannelType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(nc => nc.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("pending");

        builder.Property(nc => nc.Recipient)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(nc => nc.SentAt);

        builder.Property(nc => nc.ErrorMessage);

        builder.Property(nc => nc.RetryCount)
            .HasDefaultValue(0);

        builder.Property(nc => nc.ExternalId)
            .HasMaxLength(200);

        builder.Property(nc => nc.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        // Relationships
        builder.HasOne(nc => nc.Notification)
            .WithMany(n => n.Channels)
            .HasForeignKey(nc => nc.NotificationId)
            .OnDelete(DeleteBehavior.ClientCascade);

        // Indexes
        builder.HasIndex(nc => nc.NotificationId)
            .HasDatabaseName("IX_NotificationChannels_NotificationId");

        builder.HasIndex(nc => nc.ChannelType)
            .HasDatabaseName("IX_NotificationChannels_ChannelType");

        builder.HasIndex(nc => nc.Status)
            .HasDatabaseName("IX_NotificationChannels_Status");
    }
}
