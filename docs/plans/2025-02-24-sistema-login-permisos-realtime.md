# Sistema de Login con Permisos y Roles en Tiempo Real

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implementar sistema completo de autenticación con Active Directory (LDAP), roles, permisos y notificaciones realtime vía SSE cuando cambian permisos/roles.

**Architecture:** Migrar la lógica de autenticación del proyecto `sistema_de_firmado` adaptándola a la arquitectura feature-based de Lefarma. El sistema usará JWT con access/refresh tokens, almacenará sesiones en base de datos y notificará cambios de permisos a todos los clientes conectados mediante Server-Sent Events.

**Tech Stack:** .NET 10, EF Core 10, SQL Server, JWT, LDAP (Active Directory), SignalR/SSE, React + Vite

---

## Contexto y Alcance

### Tablas a Migrar (Esenciales)
- `app.Usuarios` - Usuarios autenticados (con soporte AD)
- `app.Roles` - Roles del sistema
- `app.Permisos` - Permisos granulares
- `app.RolesPermisos` - Relación roles-permisos
- `app.UsuariosRoles` - Asignación roles a usuarios
- `app.UsuariosPermisos` - Permisos directos a usuarios
- `app.RefreshTokens` - Tokens de refresco
- `app.Sesiones` - Sesiones activas
- `app.DominioConfig` - Configuración servidores AD
- `app.AuditLog` - Auditoría de operaciones

### Tablas NO incluidas (simplificación)
- Tokens revocados (usaremos expiración corta)
- API Keys (no aplica por ahora)

---

## Task 1: Crear Entidades de Dominio

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Usuario.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Rol.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Permiso.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/RolPermiso.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/UsuarioRol.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/UsuarioPermiso.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/RefreshToken.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Sesion.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/DominioConfig.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/AuditLog.cs`

**Step 1: Crear entidad Usuario**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Usuario.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class Usuario
{
    public int IdUsuario { get; set; }
    public string SamAccountName { get; set; } = string.Empty;
    public string Dominio { get; set; } = string.Empty;
    public string? NombreCompleto { get; set; }
    public string? Correo { get; set; }
    public bool EsAnonimo { get; set; }
    public bool EsActivo { get; set; } = true;
    public bool EsRobot { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? UltimoLogin { get; set; }
    public string? MetadataJson { get; set; }

    // Navegación
    public ICollection<UsuarioRol> UsuariosRoles { get; set; } = new List<UsuarioRol>();
    public ICollection<UsuarioPermiso> UsuariosPermisos { get; set; } = new List<UsuarioPermiso>();
    public ICollection<Sesion> Sesiones { get; set; } = new List<Sesion>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
```

**Step 2: Crear entidad Rol**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Rol.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class Rol
{
    public int IdRol { get; set; }
    public string NombreRol { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public bool EsActivo { get; set; } = true;
    public bool EsSistema { get; set; } = false;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navegación
    public ICollection<RolPermiso> RolesPermisos { get; set; } = new List<RolPermiso>();
    public ICollection<UsuarioRol> UsuariosRoles { get; set; } = new List<UsuarioRol>();
}
```

**Step 3: Crear entidad Permiso**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Permiso.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class Permiso
{
    public int IdPermiso { get; set; }
    public string CodigoPermiso { get; set; } = string.Empty;
    public string NombrePermiso { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Categoria { get; set; }
    public string? Recurso { get; set; }
    public string? Accion { get; set; }
    public bool EsActivo { get; set; } = true;
    public bool EsSistema { get; set; } = false;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Navegación
    public ICollection<RolPermiso> RolesPermisos { get; set; } = new List<RolPermiso>();
    public ICollection<UsuarioPermiso> UsuariosPermisos { get; set; } = new List<UsuarioPermiso>();
}
```

**Step 4: Crear entidades de relación**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/RolPermiso.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class RolPermiso
{
    public int IdRol { get; set; }
    public int IdPermiso { get; set; }
    public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

    public Rol Rol { get; set; } = null!;
    public Permiso Permiso { get; set; } = null!;
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/UsuarioRol.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class UsuarioRol
{
    public int IdUsuario { get; set; }
    public int IdRol { get; set; }
    public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaExpiracion { get; set; }

    public Usuario Usuario { get; set; } = null!;
    public Rol Rol { get; set; } = null!;
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/UsuarioPermiso.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class UsuarioPermiso
{
    public int IdUsuario { get; set; }
    public int IdPermiso { get; set; }
    public bool EsConcedido { get; set; } = true;
    public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

    public Usuario Usuario { get; set; } = null!;
    public Permiso Permiso { get; set; } = null!;
}
```

**Step 5: Crear entidades de sesión y tokens**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/RefreshToken.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class RefreshToken
{
    public int IdRefreshToken { get; set; }
    public int IdUsuario { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime FechaExpiracion { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public bool EsRevocado { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }

    public Usuario Usuario { get; set; } = null!;
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/Sesion.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class Sesion
{
    public Guid SessionId { get; set; } = Guid.NewGuid();
    public int IdUsuario { get; set; }
    public DateTime FechaInicio { get; set; } = DateTime.UtcNow;
    public DateTime? FechaFin { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? DeviceInfo { get; set; }

    public Usuario Usuario { get; set; } = null!;
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/DominioConfig.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class DominioConfig
{
    public int IdDominioConfig { get; set; }
    public string Dominio { get; set; } = string.Empty;
    public string Servidor { get; set; } = string.Empty;
    public int Puerto { get; set; } = 389;
    public string? BaseDn { get; set; }
    public bool EsActivo { get; set; } = true;
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/AuditLog.cs
namespace Lefarma.API.Domain.Entities.Auth;

public class AuditLog
{
    public int IdAuditLog { get; set; }
    public int? IdUsuario { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public string? EntidadId { get; set; }
    public string? ValoresAnteriores { get; set; }
    public string? ValoresNuevos { get; set; }
    public string? IpAddress { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public Usuario? Usuario { get; set; }
}
```

**Step 6: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Domain/Entities/Auth/
git commit -m "feat(auth): crear entidades de dominio Usuario, Rol, Permiso, Sesion, RefreshToken, DominioConfig, AuditLog"
```

---

## Task 2: Configuraciones EF Core (Fluent API)

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/UsuarioConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/RolConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/PermisoConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/RolPermisoConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/UsuarioRolConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/UsuarioPermisoConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/RefreshTokenConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/SesionConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/DominioConfigConfiguration.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/AuditLogConfiguration.cs`
- Modify: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/ApplicationDbContext.cs`

**Step 1: Configuración Usuario**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/UsuarioConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios", "app");
        builder.HasKey(u => u.IdUsuario);
        builder.Property(u => u.IdUsuario).UseIdentityColumn();
        builder.Property(u => u.SamAccountName).HasMaxLength(256).IsRequired();
        builder.Property(u => u.Dominio).HasMaxLength(256).IsRequired();
        builder.Property(u => u.NombreCompleto).HasMaxLength(512);
        builder.Property(u => u.Correo).HasMaxLength(512);
        builder.Property(u => u.MetadataJson).HasColumnType("nvarchar(max)");
        builder.Property(u => u.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(u => new { u.SamAccountName, u.Dominio }).IsUnique();
        builder.HasIndex(u => u.EsActivo);
    }
}
```

**Step 2: Configuración Rol**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/RolConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class RolConfiguration : IEntityTypeConfiguration<Rol>
{
    public void Configure(EntityTypeBuilder<Rol> builder)
    {
        builder.ToTable("Roles", "app");
        builder.HasKey(r => r.IdRol);
        builder.Property(r => r.IdRol).UseIdentityColumn();
        builder.Property(r => r.NombreRol).HasMaxLength(256).IsRequired();
        builder.Property(r => r.Descripcion).HasMaxLength(1024);
        builder.Property(r => r.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(r => r.NombreRol).IsUnique();
        builder.HasIndex(r => r.EsActivo);
    }
}
```

**Step 3: Configuración Permiso**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/PermisoConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class PermisoConfiguration : IEntityTypeConfiguration<Permiso>
{
    public void Configure(EntityTypeBuilder<Permiso> builder)
    {
        builder.ToTable("Permisos", "app");
        builder.HasKey(p => p.IdPermiso);
        builder.Property(p => p.IdPermiso).UseIdentityColumn();
        builder.Property(p => p.CodigoPermiso).HasMaxLength(256).IsRequired();
        builder.Property(p => p.NombrePermiso).HasMaxLength(256).IsRequired();
        builder.Property(p => p.Descripcion).HasMaxLength(1024);
        builder.Property(p => p.Categoria).HasMaxLength(128);
        builder.Property(p => p.Recurso).HasMaxLength(128);
        builder.Property(p => p.Accion).HasMaxLength(64);
        builder.Property(p => p.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(p => p.CodigoPermiso).IsUnique();
        builder.HasIndex(p => p.Categoria);
        builder.HasIndex(p => p.EsActivo);
    }
}
```

**Step 4: Configuraciones de relaciones**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/RolPermisoConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class RolPermisoConfiguration : IEntityTypeConfiguration<RolPermiso>
{
    public void Configure(EntityTypeBuilder<RolPermiso> builder)
    {
        builder.ToTable("RolesPermisos", "app");
        builder.HasKey(rp => new { rp.IdRol, rp.IdPermiso });
        builder.Property(rp => rp.FechaAsignacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(rp => rp.Rol)
            .WithMany(r => r.RolesPermisos)
            .HasForeignKey(rp => rp.IdRol)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(rp => rp.Permiso)
            .WithMany(p => p.RolesPermisos)
            .HasForeignKey(rp => rp.IdPermiso)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/UsuarioRolConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class UsuarioRolConfiguration : IEntityTypeConfiguration<UsuarioRol>
{
    public void Configure(EntityTypeBuilder<UsuarioRol> builder)
    {
        builder.ToTable("UsuariosRoles", "app");
        builder.HasKey(ur => new { ur.IdUsuario, ur.IdRol });
        builder.Property(ur => ur.FechaAsignacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(ur => ur.Usuario)
            .WithMany(u => u.UsuariosRoles)
            .HasForeignKey(ur => ur.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ur => ur.Rol)
            .WithMany(r => r.UsuariosRoles)
            .HasForeignKey(ur => ur.IdRol)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/UsuarioPermisoConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class UsuarioPermisoConfiguration : IEntityTypeConfiguration<UsuarioPermiso>
{
    public void Configure(EntityTypeBuilder<UsuarioPermiso> builder)
    {
        builder.ToTable("UsuariosPermisos", "app");
        builder.HasKey(up => new { up.IdUsuario, up.IdPermiso });
        builder.Property(up => up.FechaAsignacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasOne(up => up.Usuario)
            .WithMany(u => u.UsuariosPermisos)
            .HasForeignKey(up => up.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(up => up.Permiso)
            .WithMany(p => p.UsuariosPermisos)
            .HasForeignKey(up => up.IdPermiso)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

**Step 5: Configuraciones restantes**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/RefreshTokenConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
{
    public void Configure(EntityTypeBuilder<RefreshToken> builder)
    {
        builder.ToTable("RefreshTokens", "app");
        builder.HasKey(rt => rt.IdRefreshToken);
        builder.Property(rt => rt.IdRefreshToken).UseIdentityColumn();
        builder.Property(rt => rt.TokenHash).HasMaxLength(256).IsRequired();
        builder.Property(rt => rt.IpAddress).HasMaxLength(128);
        builder.Property(rt => rt.UserAgent).HasMaxLength(512);

        builder.HasIndex(rt => rt.TokenHash);
        builder.HasIndex(rt => rt.FechaExpiracion);
        builder.HasIndex(rt => rt.EsRevocado);

        builder.HasOne(rt => rt.Usuario)
            .WithMany(u => u.RefreshTokens)
            .HasForeignKey(rt => rt.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/SesionConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class SesionConfiguration : IEntityTypeConfiguration<Sesion>
{
    public void Configure(EntityTypeBuilder<Sesion> builder)
    {
        builder.ToTable("Sesiones", "app");
        builder.HasKey(s => s.SessionId);
        builder.Property(s => s.IpAddress).HasMaxLength(128);
        builder.Property(s => s.UserAgent).HasMaxLength(512);
        builder.Property(s => s.DeviceInfo).HasMaxLength(256);

        builder.HasIndex(s => s.IdUsuario);
        builder.HasIndex(s => s.FechaInicio);
        builder.HasIndex(s => new { s.IdUsuario, s.FechaFin }).HasFilter("[FechaFin] IS NULL");

        builder.HasOne(s => s.Usuario)
            .WithMany(u => u.Sesiones)
            .HasForeignKey(s => s.IdUsuario)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/DominioConfigConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class DominioConfigConfiguration : IEntityTypeConfiguration<DominioConfig>
{
    public void Configure(EntityTypeBuilder<DominioConfig> builder)
    {
        builder.ToTable("DominioConfig", "app");
        builder.HasKey(dc => dc.IdDominioConfig);
        builder.Property(dc => dc.IdDominioConfig).UseIdentityColumn();
        builder.Property(dc => dc.Dominio).HasMaxLength(256).IsRequired();
        builder.Property(dc => dc.Servidor).HasMaxLength(256).IsRequired();
        builder.Property(dc => dc.BaseDn).HasMaxLength(512);

        builder.HasIndex(dc => dc.Dominio).IsUnique();
    }
}
```

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/AuditLogConfiguration.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lefarma.API.Infrastructure.Data.Configurations.Auth;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLog", "app");
        builder.HasKey(al => al.IdAuditLog);
        builder.Property(al => al.IdAuditLog).UseIdentityColumn();
        builder.Property(al => al.Accion).HasMaxLength(256).IsRequired();
        builder.Property(al => al.Entidad).HasMaxLength(256).IsRequired();
        builder.Property(al => al.EntidadId).HasMaxLength(128);
        builder.Property(al => al.ValoresAnteriores).HasColumnType("nvarchar(max)");
        builder.Property(al => al.ValoresNuevos).HasColumnType("nvarchar(max)");
        builder.Property(al => al.IpAddress).HasMaxLength(128);
        builder.Property(al => al.FechaCreacion).HasDefaultValueSql("GETUTCDATE()");

        builder.HasIndex(al => al.FechaCreacion);
        builder.HasIndex(al => al.IdUsuario);
        builder.HasIndex(al => new { al.Entidad, al.EntidadId });

        builder.HasOne(al => al.Usuario)
            .WithMany()
            .HasForeignKey(al => al.IdUsuario)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
```

**Step 6: Actualizar ApplicationDbContext**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/ApplicationDbContext.cs
// Agregar DbSets al final de la clase

public DbSet<Usuario> Usuarios { get; set; }
public DbSet<Rol> Roles { get; set; }
public DbSet<Permiso> Permisos { get; set; }
public DbSet<RolPermiso> RolesPermisos { get; set; }
public DbSet<UsuarioRol> UsuariosRoles { get; set; }
public DbSet<UsuarioPermiso> UsuariosPermisos { get; set; }
public DbSet<RefreshToken> RefreshTokens { get; set; }
public DbSet<Sesion> Sesiones { get; set; }
public DbSet<DominioConfig> DominioConfig { get; set; }
public DbSet<AuditLog> AuditLog { get; set; }
```

**Step 7: Verificar compilación**

```bash
cd lefarma.backend/src/Lefarma.API
dotnet build
```

Expected: Build exitoso sin errores

**Step 8: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Infrastructure/Data/Configurations/Auth/
git add lefarma.backend/src/Lefarma.API/Infrastructure/Data/ApplicationDbContext.cs
git commit -m "feat(auth): agregar configuraciones EF Core para entidades de autenticación"
```

---

## Task 3: Crear Migraciones y Seed Data

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Migrations/xxxx_AddAuthTables.cs` (generado)
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Seed/AuthSeedData.cs`

**Step 1: Crear migración**

```bash
cd lefarma.backend/src/Lefarma.API
dotnet ef migrations add AddAuthTables --output-dir Infrastructure/Data/Migrations
```

**Step 2: Crear seed data**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Seed/AuthSeedData.cs
using Lefarma.API.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Infrastructure.Data.Seed;

public static class AuthSeedData
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        // Seed Dominios
        modelBuilder.Entity<DominioConfig>().HasData(
            new DominioConfig
            {
                IdDominioConfig = 1,
                Dominio = "CORP",
                Servidor = "dc.corp.local",
                Puerto = 389,
                BaseDn = "DC=corp,DC=local",
                EsActivo = true
            }
        );

        // Seed Roles
        modelBuilder.Entity<Rol>().HasData(
            new Rol { IdRol = 1, NombreRol = "Administrador", Descripcion = "Acceso completo al sistema", EsSistema = true },
            new Rol { IdRol = 2, NombreRol = "Usuario", Descripcion = "Usuario estándar", EsSistema = true },
            new Rol { IdRol = 3, NombreRol = "Lector", Descripcion = "Solo lectura", EsSistema = true }
        );

        // Seed Permisos
        modelBuilder.Entity<Permiso>().HasData(
            // Catálogos
            new Permiso { IdPermiso = 1, CodigoPermiso = "catalogos.ver", NombrePermiso = "Ver catálogos", Categoria = "Catálogos", Recurso = "catalogos", Accion = "ver", EsSistema = true },
            new Permiso { IdPermiso = 2, CodigoPermiso = "catalogos.crear", NombrePermiso = "Crear catálogos", Categoria = "Catálogos", Recurso = "catalogos", Accion = "crear", EsSistema = true },
            new Permiso { IdPermiso = 3, CodigoPermiso = "catalogos.editar", NombrePermiso = "Editar catálogos", Categoria = "Catálogos", Recurso = "catalogos", Accion = "editar", EsSistema = true },
            new Permiso { IdPermiso = 4, CodigoPermiso = "catalogos.eliminar", NombrePermiso = "Eliminar catálogos", Categoria = "Catálogos", Recurso = "catalogos", Accion = "eliminar", EsSistema = true },

            // Seguridad
            new Permiso { IdPermiso = 10, CodigoPermiso = "seguridad.usuarios.ver", NombrePermiso = "Ver usuarios", Categoria = "Seguridad", Recurso = "usuarios", Accion = "ver", EsSistema = true },
            new Permiso { IdPermiso = 11, CodigoPermiso = "seguridad.usuarios.gestionar", NombrePermiso = "Gestionar usuarios", Categoria = "Seguridad", Recurso = "usuarios", Accion = "gestionar", EsSistema = true },
            new Permiso { IdPermiso = 12, CodigoPermiso = "seguridad.roles.ver", NombrePermiso = "Ver roles", Categoria = "Seguridad", Recurso = "roles", Accion = "ver", EsSistema = true },
            new Permiso { IdPermiso = 13, CodigoPermiso = "seguridad.roles.gestionar", NombrePermiso = "Gestionar roles", Categoria = "Seguridad", Recurso = "roles", Accion = "gestionar", EsSistema = true },
            new Permiso { IdPermiso = 14, CodigoPermiso = "seguridad.permisos.ver", NombrePermiso = "Ver permisos", Categoria = "Seguridad", Recurso = "permisos", Accion = "ver", EsSistema = true },
            new Permiso { IdPermiso = 15, CodigoPermiso = "seguridad.permisos.gestionar", NombrePermiso = "Gestionar permisos", Categoria = "Seguridad", Recurso = "permisos", Accion = "gestionar", EsSistema = true }
        );

        // Seed Roles-Permisos (Administrador tiene todos)
        modelBuilder.Entity<RolPermiso>().HasData(
            new RolPermiso { IdRol = 1, IdPermiso = 1 },
            new RolPermiso { IdRol = 1, IdPermiso = 2 },
            new RolPermiso { IdRol = 1, IdPermiso = 3 },
            new RolPermiso { IdRol = 1, IdPermiso = 4 },
            new RolPermiso { IdRol = 1, IdPermiso = 10 },
            new RolPermiso { IdRol = 1, IdPermiso = 11 },
            new RolPermiso { IdRol = 1, IdPermiso = 12 },
            new RolPermiso { IdRol = 1, IdPermiso = 13 },
            new RolPermiso { IdRol = 1, IdPermiso = 14 },
            new RolPermiso { IdRol = 1, IdPermiso = 15 }
        );

        // Seed Roles-Permisos (Usuario estándar)
        modelBuilder.Entity<RolPermiso>().HasData(
            new RolPermiso { IdRol = 2, IdPermiso = 1 },
            new RolPermiso { IdRol = 2, IdPermiso = 10 }
        );

        // Seed Roles-Permisos (Lector)
        modelBuilder.Entity<RolPermiso>().HasData(
            new RolPermiso { IdRol = 3, IdPermiso = 1 },
            new RolPermiso { IdRol = 3, IdPermiso = 10 }
        );
    }
}
```

**Step 3: Actualizar ApplicationDbContext.OnModelCreating**

```csharp
// En ApplicationDbContext.cs, al final de OnModelCreating
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

    // Seed data
    AuthSeedData.Seed(modelBuilder);
}
```

**Step 4: Aplicar migración**

```bash
cd lefarma.backend/src/Lefarma.API
dotnet ef database update
```

Expected: Migración aplicada exitosamente

**Step 5: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Infrastructure/Data/Seed/
git add lefarma.backend/src/Lefarma.API/Infrastructure/Data/Migrations/
git add lefarma.backend/src/Lefarma.API/Infrastructure/Data/ApplicationDbContext.cs
git commit -m "feat(auth): agregar migraciones y seed data para roles y permisos"
```

---

## Task 4: Interfaces de Repositorios

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IAuthRepository.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IUsuarioRepository.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IRolRepository.cs`
- Create: `lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IPermisoRepository.cs`

**Step 1: Crear IAuthRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IAuthRepository.cs
using Lefarma.API.Domain.Entities.Auth;

namespace Lefarma.API.Domain.Interfaces.Auth;

public interface IAuthRepository
{
    // Usuarios
    Task<Usuario?> GetUsuarioBySamAccountNameAsync(string samAccountName, string dominio);
    Task<Usuario> CreateUsuarioAsync(Usuario usuario);
    Task UpdateUsuarioAsync(Usuario usuario);

    // Sesiones
    Task<Sesion> CreateSesionAsync(Sesion sesion);
    Task CloseSesionAsync(Guid sessionId);
    Task<IEnumerable<Sesion>> GetSesionesActivasByUsuarioAsync(int idUsuario);

    // Refresh Tokens
    Task<RefreshToken> SaveRefreshTokenAsync(RefreshToken token);
    Task<RefreshToken?> GetRefreshTokenByHashAsync(string tokenHash);
    Task RevokeRefreshTokenAsync(int idRefreshToken);
    Task RevokeAllUserTokensAsync(int idUsuario);

    // Roles y Permisos
    Task<IEnumerable<Rol>> GetUserRolesAsync(int idUsuario);
    Task<IEnumerable<Permiso>> GetUserPermissionsAsync(int idUsuario);

    // Dominio Config
    Task<IEnumerable<DominioConfig>> GetActiveDominiosAsync();

    // Auditoría
    Task AddAuditLogAsync(AuditLog auditLog);
}
```

**Step 2: Crear IUsuarioRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IUsuarioRepository.cs
using Lefarma.API.Domain.Entities.Auth;

namespace Lefarma.API.Domain.Interfaces.Auth;

public interface IUsuarioRepository
{
    Task<IEnumerable<Usuario>> GetAllAsync();
    Task<Usuario?> GetByIdAsync(int id);
    Task<Usuario> CreateAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task DeleteAsync(int id);
    Task AssignRolAsync(int idUsuario, int idRol, DateTime? fechaExpiracion = null);
    Task RemoveRolAsync(int idUsuario, int idRol);
    Task AssignPermisoAsync(int idUsuario, int idPermiso, bool esConcedido = true);
    Task RemovePermisoAsync(int idUsuario, int idPermiso);
}
```

**Step 3: Crear IRolRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IRolRepository.cs
using Lefarma.API.Domain.Entities.Auth;

namespace Lefarma.API.Domain.Interfaces.Auth;

public interface IRolRepository
{
    Task<IEnumerable<Rol>> GetAllAsync();
    Task<Rol?> GetByIdAsync(int id);
    Task<Rol?> GetByNameAsync(string nombre);
    Task<Rol> CreateAsync(Rol rol);
    Task UpdateAsync(Rol rol);
    Task DeleteAsync(int id);
    Task AssignPermisoAsync(int idRol, int idPermiso);
    Task RemovePermisoAsync(int idRol, int idPermiso);
    Task<IEnumerable<Permiso>> GetPermisosByRolAsync(int idRol);
}
```

**Step 4: Crear IPermisoRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/IPermisoRepository.cs
using Lefarma.API.Domain.Entities.Auth;

namespace Lefarma.API.Domain.Interfaces.Auth;

public interface IPermisoRepository
{
    Task<IEnumerable<Permiso>> GetAllAsync();
    Task<Permiso?> GetByIdAsync(int id);
    Task<Permiso?> GetByCodigoAsync(string codigo);
    Task<Permiso> CreateAsync(Permiso permiso);
    Task UpdateAsync(Permiso permiso);
    Task DeleteAsync(int id);
    Task<IEnumerable<Permiso>> GetByCategoriaAsync(string categoria);
}
```

**Step 5: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Domain/Interfaces/Auth/
git commit -m "feat(auth): crear interfaces de repositorios para autenticación"
```

---

## Task 5: Implementaciones de Repositorios

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/AuthRepository.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/UsuarioRepository.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/RolRepository.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/PermisoRepository.cs`

**Step 1: Crear AuthRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/AuthRepository.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Infrastructure.Data.Repositories.Auth;

public class AuthRepository : IAuthRepository
{
    private readonly ApplicationDbContext _context;

    public AuthRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetUsuarioBySamAccountNameAsync(string samAccountName, string dominio)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.SamAccountName == samAccountName && u.Dominio == dominio);
    }

    public async Task<Usuario> CreateUsuarioAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task UpdateUsuarioAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<Sesion> CreateSesionAsync(Sesion sesion)
    {
        _context.Sesiones.Add(sesion);
        await _context.SaveChangesAsync();
        return sesion;
    }

    public async Task CloseSesionAsync(Guid sessionId)
    {
        var sesion = await _context.Sesiones.FindAsync(sessionId);
        if (sesion != null)
        {
            sesion.FechaFin = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Sesion>> GetSesionesActivasByUsuarioAsync(int idUsuario)
    {
        return await _context.Sesiones
            .AsNoTracking()
            .Where(s => s.IdUsuario == idUsuario && s.FechaFin == null)
            .ToListAsync();
    }

    public async Task<RefreshToken> SaveRefreshTokenAsync(RefreshToken token)
    {
        _context.RefreshTokens.Add(token);
        await _context.SaveChangesAsync();
        return token;
    }

    public async Task<RefreshToken?> GetRefreshTokenByHashAsync(string tokenHash)
    {
        return await _context.RefreshTokens
            .Include(rt => rt.Usuario)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && !rt.EsRevocado);
    }

    public async Task RevokeRefreshTokenAsync(int idRefreshToken)
    {
        var token = await _context.RefreshTokens.FindAsync(idRefreshToken);
        if (token != null)
        {
            token.EsRevocado = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task RevokeAllUserTokensAsync(int idUsuario)
    {
        var tokens = await _context.RefreshTokens
            .Where(rt => rt.IdUsuario == idUsuario && !rt.EsRevocado)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.EsRevocado = true;
        }
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<Rol>> GetUserRolesAsync(int idUsuario)
    {
        return await _context.UsuariosRoles
            .AsNoTracking()
            .Where(ur => ur.IdUsuario == idUsuario &&
                        (ur.FechaExpiracion == null || ur.FechaExpiracion > DateTime.UtcNow))
            .Select(ur => ur.Rol)
            .Where(r => r.EsActivo)
            .ToListAsync();
    }

    public async Task<IEnumerable<Permiso>> GetUserPermissionsAsync(int idUsuario)
    {
        // Permisos desde roles
        var permisosPorRoles = await _context.UsuariosRoles
            .AsNoTracking()
            .Where(ur => ur.IdUsuario == idUsuario &&
                        (ur.FechaExpiracion == null || ur.FechaExpiracion > DateTime.UtcNow))
            .SelectMany(ur => ur.Rol.RolesPermisos)
            .Where(rp => rp.Permiso.EsActivo)
            .Select(rp => rp.Permiso)
            .ToListAsync();

        // Permisos directos (override)
        var permisosDirectos = await _context.UsuariosPermisos
            .AsNoTracking()
            .Where(up => up.IdUsuario == idUsuario && up.EsConcedido)
            .Select(up => up.Permiso)
            .Where(p => p.EsActivo)
            .ToListAsync();

        return permisosPorRoles.Union(permisosDirectos).Distinct();
    }

    public async Task<IEnumerable<DominioConfig>> GetActiveDominiosAsync()
    {
        return await _context.DominioConfig
            .AsNoTracking()
            .Where(dc => dc.EsActivo)
            .ToListAsync();
    }

    public async Task AddAuditLogAsync(AuditLog auditLog)
    {
        _context.AuditLog.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}
```

**Step 2: Crear UsuarioRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/UsuarioRepository.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Infrastructure.Data.Repositories.Auth;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly ApplicationDbContext _context;

    public UsuarioRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync()
    {
        return await _context.Usuarios
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Usuario?> GetByIdAsync(int id)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .Include(u => u.UsuariosRoles)
                .ThenInclude(ur => ur.Rol)
            .Include(u => u.UsuariosPermisos)
                .ThenInclude(up => up.Permiso)
            .FirstOrDefaultAsync(u => u.IdUsuario == id);
    }

    public async Task<Usuario> CreateAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario != null)
        {
            usuario.EsActivo = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task AssignRolAsync(int idUsuario, int idRol, DateTime? fechaExpiracion = null)
    {
        var exists = await _context.UsuariosRoles
            .AnyAsync(ur => ur.IdUsuario == idUsuario && ur.IdRol == idRol);

        if (!exists)
        {
            _context.UsuariosRoles.Add(new UsuarioRol
            {
                IdUsuario = idUsuario,
                IdRol = idRol,
                FechaExpiracion = fechaExpiracion
            });
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveRolAsync(int idUsuario, int idRol)
    {
        var ur = await _context.UsuariosRoles
            .FirstOrDefaultAsync(x => x.IdUsuario == idUsuario && x.IdRol == idRol);

        if (ur != null)
        {
            _context.UsuariosRoles.Remove(ur);
            await _context.SaveChangesAsync();
        }
    }

    public async Task AssignPermisoAsync(int idUsuario, int idPermiso, bool esConcedido = true)
    {
        var exists = await _context.UsuariosPermisos
            .FirstOrDefaultAsync(up => up.IdUsuario == idUsuario && up.IdPermiso == idPermiso);

        if (exists == null)
        {
            _context.UsuariosPermisos.Add(new UsuarioPermiso
            {
                IdUsuario = idUsuario,
                IdPermiso = idPermiso,
                EsConcedido = esConcedido
            });
        }
        else
        {
            exists.EsConcedido = esConcedido;
        }
        await _context.SaveChangesAsync();
    }

    public async Task RemovePermisoAsync(int idUsuario, int idPermiso)
    {
        var up = await _context.UsuariosPermisos
            .FirstOrDefaultAsync(x => x.IdUsuario == idUsuario && x.IdPermiso == idPermiso);

        if (up != null)
        {
            _context.UsuariosPermisos.Remove(up);
            await _context.SaveChangesAsync();
        }
    }
}
```

**Step 3: Crear RolRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/RolRepository.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Infrastructure.Data.Repositories.Auth;

public class RolRepository : IRolRepository
{
    private readonly ApplicationDbContext _context;

    public RolRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Rol>> GetAllAsync()
    {
        return await _context.Roles
            .AsNoTracking()
            .Include(r => r.RolesPermisos)
                .ThenInclude(rp => rp.Permiso)
            .ToListAsync();
    }

    public async Task<Rol?> GetByIdAsync(int id)
    {
        return await _context.Roles
            .AsNoTracking()
            .Include(r => r.RolesPermisos)
                .ThenInclude(rp => rp.Permiso)
            .FirstOrDefaultAsync(r => r.IdRol == id);
    }

    public async Task<Rol?> GetByNameAsync(string nombre)
    {
        return await _context.Roles
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.NombreRol == nombre);
    }

    public async Task<Rol> CreateAsync(Rol rol)
    {
        _context.Roles.Add(rol);
        await _context.SaveChangesAsync();
        return rol;
    }

    public async Task UpdateAsync(Rol rol)
    {
        _context.Roles.Update(rol);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var rol = await _context.Roles.FindAsync(id);
        if (rol != null && !rol.EsSistema)
        {
            rol.EsActivo = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task AssignPermisoAsync(int idRol, int idPermiso)
    {
        var exists = await _context.RolesPermisos
            .AnyAsync(rp => rp.IdRol == idRol && rp.IdPermiso == idPermiso);

        if (!exists)
        {
            _context.RolesPermisos.Add(new RolPermiso
            {
                IdRol = idRol,
                IdPermiso = idPermiso
            });
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemovePermisoAsync(int idRol, int idPermiso)
    {
        var rp = await _context.RolesPermisos
            .FirstOrDefaultAsync(x => x.IdRol == idRol && x.IdPermiso == idPermiso);

        if (rp != null)
        {
            _context.RolesPermisos.Remove(rp);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Permiso>> GetPermisosByRolAsync(int idRol)
    {
        return await _context.RolesPermisos
            .AsNoTracking()
            .Where(rp => rp.IdRol == idRol)
            .Select(rp => rp.Permiso)
            .Where(p => p.EsActivo)
            .ToListAsync();
    }
}
```

**Step 4: Crear PermisoRepository**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/PermisoRepository.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Microsoft.EntityFrameworkCore;

namespace Lefarma.API.Infrastructure.Data.Repositories.Auth;

public class PermisoRepository : IPermisoRepository
{
    private readonly ApplicationDbContext _context;

    public PermisoRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Permiso>> GetAllAsync()
    {
        return await _context.Permisos
            .AsNoTracking()
            .OrderBy(p => p.Categoria)
            .ThenBy(p => p.NombrePermiso)
            .ToListAsync();
    }

    public async Task<Permiso?> GetByIdAsync(int id)
    {
        return await _context.Permisos
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdPermiso == id);
    }

    public async Task<Permiso?> GetByCodigoAsync(string codigo)
    {
        return await _context.Permisos
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.CodigoPermiso == codigo);
    }

    public async Task<Permiso> CreateAsync(Permiso permiso)
    {
        _context.Permisos.Add(permiso);
        await _context.SaveChangesAsync();
        return permiso;
    }

    public async Task UpdateAsync(Permiso permiso)
    {
        _context.Permisos.Update(permiso);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var permiso = await _context.Permisos.FindAsync(id);
        if (permiso != null && !permiso.EsSistema)
        {
            permiso.EsActivo = false;
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Permiso>> GetByCategoriaAsync(string categoria)
    {
        return await _context.Permisos
            .AsNoTracking()
            .Where(p => p.Categoria == categoria && p.EsActivo)
            .OrderBy(p => p.NombrePermiso)
            .ToListAsync();
    }
}
```

**Step 5: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Infrastructure/Data/Repositories/Auth/
git commit -m "feat(auth): implementar repositorios de autenticación"
```

---

## Task 6: Servicio de LDAP/Active Directory

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Ldap/ILdapService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Ldap/LdapService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Ldap/LdapSettings.cs`

**Step 1: Crear ILdapService**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Ldap/ILdapService.cs
namespace Lefarma.API.Infrastructure.Services.Ldap;

public interface ILdapService
{
    Task<LdapValidationResult> ValidateCredentialsAsync(string servidor, int puerto, string baseDn, string dominio, string usuario, string password);
    Task<IEnumerable<LdapUser>> SearchUsersAsync(string servidor, int puerto, string baseDn, string filtro);
}

public class LdapValidationResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public LdapUser? User { get; set; }
}

public class LdapUser
{
    public string SamAccountName { get; set; } = string.Empty;
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string Dominio { get; set; } = string.Empty;
}
```

**Step 2: Crear LdapService**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Ldap/LdapService.cs
using System.DirectoryServices.Protocols;
using System.Net;

namespace Lefarma.API.Infrastructure.Services.Ldap;

public class LdapService : ILdapService
{
    private readonly ILogger<LdapService> _logger;

    public LdapService(ILogger<LdapService> logger)
    {
        _logger = logger;
    }

    public async Task<LdapValidationResult> ValidateCredentialsAsync(
        string servidor, int puerto, string baseDn, string dominio, string usuario, string password)
    {
        try
        {
            using var connection = new LdapConnection(new LdapDirectoryIdentifier(servidor, puerto));
            connection.AuthType = AuthType.Basic;

            var userDn = $"{domino}\\{usuario}";
            connection.Credentials = new NetworkCredential(userDn, password);
            connection.Timeout = TimeSpan.FromSeconds(10);

            await Task.Run(() => connection.Bind());

            // Si llegamos aquí, las credenciales son válidas
            // Buscamos información adicional del usuario
            var userInfo = await SearchUserAsync(connection, baseDn, usuario);

            return new LdapValidationResult
            {
                Success = true,
                User = userInfo
            };
        }
        catch (LdapException ex)
        {
            _logger.LogWarning("LDAP validation failed for user {Usuario}: {Error}", usuario, ex.Message);
            return new LdapValidationResult
            {
                Success = false,
                ErrorMessage = "Credenciales inválidas"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating LDAP credentials for user {Usuario}", usuario);
            return new LdapValidationResult
            {
                Success = false,
                ErrorMessage = "Error de conexión con Active Directory"
            };
        }
    }

    public async Task<IEnumerable<LdapUser>> SearchUsersAsync(
        string servidor, int puerto, string baseDn, string filtro)
    {
        var users = new List<LdapUser>();

        try
        {
            using var connection = new LdapConnection(new LdapDirectoryIdentifier(servidor, puerto));
            // Para búsquedas anónimas o con credenciales de servicio
            connection.AuthType = AuthType.Anonymous;

            var searchRequest = new SearchRequest(
                baseDn,
                filtro,
                SearchScope.Subtree,
                "sAMAccountName", "displayName", "mail", "userPrincipalName");

            var response = await Task.Run(() =>
                (SearchResponse)connection.SendRequest(searchRequest));

            foreach (SearchResultEntry entry in response.Entries)
            {
                users.Add(new LdapUser
                {
                    SamAccountName = GetAttributeValue(entry, "sAMAccountName"),
                    NombreCompleto = GetAttributeValue(entry, "displayName"),
                    Correo = GetAttributeValue(entry, "mail")
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching LDAP users");
        }

        return users;
    }

    private async Task<LdapUser?> SearchUserAsync(LdapConnection connection, string baseDn, string usuario)
    {
        try
        {
            var searchRequest = new SearchRequest(
                baseDn,
                $"(sAMAccountName={usuario})",
                SearchScope.Subtree,
                "sAMAccountName", "displayName", "mail", "userPrincipalName");

            var response = await Task.Run(() =>
                (SearchResponse)connection.SendRequest(searchRequest));

            if (response.Entries.Count > 0)
            {
                var entry = response.Entries[0];
                return new LdapUser
                {
                    SamAccountName = GetAttributeValue(entry, "sAMAccountName"),
                    NombreCompleto = GetAttributeValue(entry, "displayName"),
                    Correo = GetAttributeValue(entry, "mail")
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching LDAP user {Usuario}", usuario);
        }

        return null;
    }

    private static string GetAttributeValue(SearchResultEntry entry, string attributeName)
    {
        if (entry.Attributes.Contains(attributeName))
        {
            var value = entry.Attributes[attributeName].GetValues(typeof(string)).FirstOrDefault();
            return value?.ToString() ?? string.Empty;
        }
        return string.Empty;
    }
}
```

**Step 3: Actualizar csproj**

```bash
# Verificar si está instalado el paquete LDAP
dotnet add package System.DirectoryServices.Protocols
```

**Step 4: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Infrastructure/Services/Ldap/
git commit -m "feat(auth): implementar servicio LDAP para Active Directory"
```

---

## Task 7: Servicio de Tokens JWT

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/ITokenService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/TokenService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/JwtSettings.cs`

**Step 1: Crear ITokensService**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/ITokenService.cs
using Lefarma.API.Domain.Entities.Auth;

namespace Lefarma.API.Infrastructure.Services.Auth;

public interface ITokenService
{
    Task<TokenResult> GenerateTokensAsync(Usuario usuario, string ipAddress, string userAgent);
    Task<TokenResult?> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent);
    Task<bool> RevokeTokenAsync(string refreshToken);
    Task<bool> ValidateAccessTokenAsync(string token);
}

public class TokenResult
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime AccessTokenExpiration { get; set; }
    public DateTime RefreshTokenExpiration { get; set; }
}
```

**Step 2: Crear JwtSettings**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/JwtSettings.cs
namespace Lefarma.API.Infrastructure.Services.Auth;

public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public int AccessTokenExpirationMinutes { get; set; } = 60;
    public int RefreshTokenExpirationMinutes { get; set; } = 43200; // 30 días
}
```

**Step 3: Crear TokenService**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/TokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Lefarma.API.Infrastructure.Services.Auth;

public class TokenService : ITokenService
{
    private readonly IAuthRepository _authRepository;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<TokenService> _logger;

    public TokenService(
        IAuthRepository authRepository,
        IOptions<JwtSettings> jwtSettings,
        ILogger<TokenService> logger)
    {
        _authRepository = authRepository;
        _jwtSettings = jwtSettings.Value;
        _logger = logger;
    }

    public async Task<TokenResult> GenerateTokensAsync(Usuario usuario, string ipAddress, string userAgent)
    {
        var roles = await _authRepository.GetUserRolesAsync(usuario.IdUsuario);
        var permisos = await _authRepository.GetUserPermissionsAsync(usuario.IdUsuario);

        var accessToken = GenerateAccessToken(usuario, roles, permisos);
        var refreshTokenValue = GenerateRefreshToken();
        var refreshTokenHash = HashToken(refreshTokenValue);

        var refreshToken = new RefreshToken
        {
            IdUsuario = usuario.IdUsuario,
            TokenHash = refreshTokenHash,
            FechaExpiracion = DateTime.UtcNow.AddMinutes(_jwtSettings.RefreshTokenExpirationMinutes),
            IpAddress = ipAddress,
            UserAgent = userAgent
        };

        await _authRepository.SaveRefreshTokenAsync(refreshToken);

        return new TokenResult
        {
            AccessToken = accessToken,
            RefreshToken = refreshTokenValue,
            AccessTokenExpiration = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            RefreshTokenExpiration = refreshToken.FechaExpiracion
        };
    }

    public async Task<TokenResult?> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent)
    {
        var tokenHash = HashToken(refreshToken);
        var storedToken = await _authRepository.GetRefreshTokenByHashAsync(tokenHash);

        if (storedToken == null || storedToken.FechaExpiracion < DateTime.UtcNow)
        {
            return null;
        }

        await _authRepository.RevokeRefreshTokenAsync(storedToken.IdRefreshToken);

        return await GenerateTokensAsync(storedToken.Usuario, ipAddress, userAgent);
    }

    public async Task<bool> RevokeTokenAsync(string refreshToken)
    {
        var tokenHash = HashToken(refreshToken);
        var storedToken = await _authRepository.GetRefreshTokenByHashAsync(tokenHash);

        if (storedToken == null)
        {
            return false;
        }

        await _authRepository.RevokeRefreshTokenAsync(storedToken.IdRefreshToken);
        return true;
    }

    public Task<bool> ValidateAccessTokenAsync(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _jwtSettings.Issuer,
                ValidateAudience = true,
                ValidAudience = _jwtSettings.Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return Task.FromResult(true);
        }
        catch
        {
            return Task.FromResult(false);
        }
    }

    private string GenerateAccessToken(Usuario usuario, IEnumerable<Rol> roles, IEnumerable<Permiso> permisos)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("id_usuario", usuario.IdUsuario.ToString()),
            new(ClaimTypes.Name, usuario.SamAccountName),
            new("dominio", usuario.Dominio),
            new("es_anonimo", usuario.EsAnonimo.ToString().ToLower())
        };

        if (!string.IsNullOrEmpty(usuario.Correo))
        {
            claims.Add(new Claim(ClaimTypes.Email, usuario.Correo));
        }

        // Agregar roles como claims
        foreach (var rol in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, rol.NombreRol));
        }

        // Agregar permisos como claim JSON
        var permisosArray = permisos.Select(p => p.CodigoPermiso).ToList();
        claims.Add(new Claim("permisos", System.Text.Json.JsonSerializer.Serialize(permisosArray)));

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
```

**Step 4: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Infrastructure/Services/Auth/
git commit -m "feat(auth): implementar servicio de generación de tokens JWT"
```

---

## Task 8: Servicio de Autenticación

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/IAuthService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/AuthService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/LoginRequest.cs`
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/LoginResponse.cs`

**Step 1: Crear DTOs**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/LoginRequest.cs
using System.ComponentModel.DataAnnotations;

namespace Lefarma.API.Features.Auth;

public class LoginRequest
{
    [Required(ErrorMessage = "El usuario es requerido")]
    public string Usuario { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida")]
    public string Password { get; set; } = string.Empty;

    public string? Dominio { get; set; }
}

public class LoginStepOneResponse
{
    public bool RequiereSeleccionDominio { get; set; }
    public List<DominioInfo> DominiosDisponibles { get; set; } = new();
}

public class DominioInfo
{
    public string Dominio { get; set; } = string.Empty;
    public string Servidor { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public UserInfo User { get; set; } = new();
}

public class UserInfo
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Correo { get; set; }
    public string Dominio { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
    public List<string> Permisos { get; set; } = new();
}
```

**Step 2: Crear IAuthService**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/IAuthService.cs
namespace Lefarma.API.Features.Auth;

public interface IAuthService
{
    Task<LoginStepOneResponse?> LoginStepOneAsync(string usuario);
    Task<LoginResponse?> LoginAsync(LoginRequest request, string ipAddress, string userAgent);
    Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent);
    Task<bool> LogoutAsync(string refreshToken);
    Task<bool> LogoutAllAsync(int idUsuario);
}
```

**Step 3: Crear AuthService**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/AuthService.cs
using System.Security.Cryptography;
using System.Text;
using ErrorOr;
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Lefarma.API.Infrastructure.Services.Auth;
using Lefarma.API.Infrastructure.Services.Ldap;
using Lefarma.API.Shared;
using Lefarma.API.Shared.Logging;

namespace Lefarma.API.Features.Auth;

public class AuthService : BaseService, IAuthService
{
    private readonly IAuthRepository _authRepository;
    private readonly ITokenService _tokenService;
    private readonly ILdapService _ldapService;

    public AuthService(
        IAuthRepository authRepository,
        ITokenService tokenService,
        ILdapService ldapService,
        IWideEventAccessor wideEventAccessor,
        ILogger<AuthService> logger)
        : base(wideEventAccessor, logger)
    {
        _authRepository = authRepository;
        _tokenService = tokenService;
        _ldapService = ldapService;
    }

    public async Task<LoginStepOneResponse?> LoginStepOneAsync(string usuario)
    {
        var dominios = await _authRepository.GetActiveDominiosAsync();
        var dominiosList = dominios.ToList();

        if (dominiosList.Count == 0)
        {
            return null;
        }

        if (dominiosList.Count == 1)
        {
            // Solo hay un dominio, no requiere selección
            return new LoginStepOneResponse
            {
                RequiereSeleccionDominio = false,
                DominiosDisponibles = new List<DominioInfo>()
            };
        }

        return new LoginStepOneResponse
        {
            RequiereSeleccionDominio = true,
            DominiosDisponibles = dominiosList.Select(d => new DominioInfo
            {
                Dominio = d.Dominio,
                Servidor = d.Servidor
            }).ToList()
        };
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, string ipAddress, string userAgent)
    {
        // Obtener configuración de dominios
        var dominios = await _authRepository.GetActiveDominiosAsync();
        var dominiosList = dominios.ToList();

        if (!dominiosList.Any())
        {
            return null;
        }

        // Si especificó dominio, usamos ese. Si no, iteramos por todos
        var dominiosAProbar = !string.IsNullOrEmpty(request.Dominio)
            ? dominiosList.Where(d => d.Dominio == request.Dominio)
            : dominiosList;

        LdapUser? ldapUser = null;
        DominioConfig? dominioConfig = null;

        foreach (var dominio in dominiosAProbar)
        {
            var result = await _ldapService.ValidateCredentialsAsync(
                dominio.Servidor,
                dominio.Puerto,
                dominio.BaseDn ?? string.Empty,
                dominio.Dominio,
                request.Usuario,
                request.Password);

            if (result.Success && result.User != null)
            {
                ldapUser = result.User;
                dominioConfig = dominio;
                break;
            }
        }

        if (ldapUser == null || dominioConfig == null)
        {
            return null;
        }

        // Obtener o crear usuario en nuestra base de datos
        var usuario = await _authRepository.GetUsuarioBySamAccountNameAsync(
            ldapUser.SamAccountName,
            dominioConfig.Dominio);

        if (usuario == null)
        {
            usuario = new Usuario
            {
                SamAccountName = ldapUser.SamAccountName,
                Dominio = dominioConfig.Dominio,
                NombreCompleto = ldapUser.NombreCompleto,
                Correo = ldapUser.Correo,
                FechaCreacion = DateTime.UtcNow
            };
            usuario = await _authRepository.CreateUsuarioAsync(usuario);

            // Asignar rol por defecto (Usuario)
            var roles = await _authRepository.GetUserRolesAsync(usuario.IdUsuario);
            if (!roles.Any())
            {
                await AssignDefaultRoleAsync(usuario.IdUsuario);
            }
        }

        // Actualizar último login
        usuario.UltimoLogin = DateTime.UtcNow;
        await _authRepository.UpdateUsuarioAsync(usuario);

        // Crear sesión
        var sesion = new Sesion
        {
            IdUsuario = usuario.IdUsuario,
            IpAddress = ipAddress,
            UserAgent = userAgent
        };
        await _authRepository.CreateSesionAsync(sesion);

        // Generar tokens
        var tokens = await _tokenService.GenerateTokensAsync(usuario, ipAddress, userAgent);
        var userRoles = await _authRepository.GetUserRolesAsync(usuario.IdUsuario);
        var userPermisos = await _authRepository.GetUserPermissionsAsync(usuario.IdUsuario);

        await LogEventAsync("Login", $"Usuario {usuario.SamAccountName} inició sesión", usuario.IdUsuario);

        return new LoginResponse
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            Expiration = tokens.AccessTokenExpiration,
            User = new UserInfo
            {
                Id = usuario.IdUsuario,
                Nombre = usuario.NombreCompleto ?? usuario.SamAccountName,
                Correo = usuario.Correo,
                Dominio = usuario.Dominio,
                Roles = userRoles.Select(r => r.NombreRol).ToList(),
                Permisos = userPermisos.Select(p => p.CodigoPermiso).ToList()
            }
        };
    }

    public async Task<LoginResponse?> RefreshTokenAsync(string refreshToken, string ipAddress, string userAgent)
    {
        var tokens = await _tokenService.RefreshTokenAsync(refreshToken, ipAddress, userAgent);

        if (tokens == null)
        {
            return null;
        }

        // Extraer info del usuario del token
        var tokenHash = HashToken(refreshToken);
        var storedToken = await _authRepository.GetRefreshTokenByHashAsync(tokenHash);

        if (storedToken == null)
        {
            return null;
        }

        var usuario = storedToken.Usuario;
        var userRoles = await _authRepository.GetUserRolesAsync(usuario.IdUsuario);
        var userPermisos = await _authRepository.GetUserPermissionsAsync(usuario.IdUsuario);

        return new LoginResponse
        {
            AccessToken = tokens.AccessToken,
            RefreshToken = tokens.RefreshToken,
            Expiration = tokens.AccessTokenExpiration,
            User = new UserInfo
            {
                Id = usuario.IdUsuario,
                Nombre = usuario.NombreCompleto ?? usuario.SamAccountName,
                Correo = usuario.Correo,
                Dominio = usuario.Dominio,
                Roles = userRoles.Select(r => r.NombreRol).ToList(),
                Permisos = userPermisos.Select(p => p.CodigoPermiso).ToList()
            }
        };
    }

    public async Task<bool> LogoutAsync(string refreshToken)
    {
        return await _tokenService.RevokeTokenAsync(refreshToken);
    }

    public async Task<bool> LogoutAllAsync(int idUsuario)
    {
        await _authRepository.RevokeAllUserTokensAsync(idUsuario);

        // Cerrar todas las sesiones activas
        var sesiones = await _authRepository.GetSesionesActivasByUsuarioAsync(idUsuario);
        foreach (var sesion in sesiones)
        {
            await _authRepository.CloseSesionAsync(sesion.SessionId);
        }

        await LogEventAsync("LogoutAll", $"Usuario {idUsuario} cerró todas las sesiones", idUsuario);
        return true;
    }

    private async Task AssignDefaultRoleAsync(int idUsuario)
    {
        // Asignar rol "Usuario" (Id = 2 según seed data)
        await _authRepository.AddAuditLogAsync(new AuditLog
        {
            IdUsuario = idUsuario,
            Accion = "AssignDefaultRole",
            Entidad = "UsuarioRol",
            ValoresNuevos = "{ IdRol: 2 }"
        });
    }

    private static string HashToken(string token)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
```

**Step 4: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Features/Auth/
git commit -m "feat(auth): implementar servicio de autenticación con LDAP"
```

---

## Task 9: Servicio de Notificaciones SSE

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/INotificationService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/SseNotificationService.cs`
- Create: `lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/PermissionChangedEvent.cs`

**Step 1: Crear eventos**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/PermissionChangedEvent.cs
namespace Lefarma.API.Infrastructure.Services.Realtime;

public class PermissionChangedEvent
{
    public string EventType { get; set; } = string.Empty;
    public int? AffectedUserId { get; set; }
    public string? RolCodigo { get; set; }
    public string? PermisoCodigo { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class UserPermissionsUpdate
{
    public int UserId { get; set; }
    public List<string> Roles { get; set; } = new();
    public List<string> Permisos { get; set; } = new();
    public string? Reason { get; set; }
}
```

**Step 2: Crear INotificationService**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/INotificationService.cs
namespace Lefarma.API.Infrastructure.Services.Realtime;

public interface INotificationService
{
    // SSE
    Task SubscribeAsync(string connectionId, int userId, StreamWriter writer);
    Task UnsubscribeAsync(string connectionId);
    Task NotifyPermissionChangedAsync(PermissionChangedEvent eventData);
    Task NotifyUserPermissionsChangedAsync(int userId, UserPermissionsUpdate update);
    Task BroadcastPermissionsChangedAsync(UserPermissionsUpdate update);
}
```

**Step 3: Crear SseNotificationService**

```csharp
// lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/SseNotificationService.cs
using System.Collections.Concurrent;
using System.Text.Json;

namespace Lefarma.API.Infrastructure.Services.Realtime;

public class SseNotificationService : INotificationService
{
    private readonly ILogger<SseNotificationService> _logger;
    private readonly ConcurrentDictionary<string, (int UserId, StreamWriter Writer)> _connections = new();
    private readonly ConcurrentDictionary<int, HashSet<string>> _userConnections = new();

    public SseNotificationService(ILogger<SseNotificationService> logger)
    {
        _logger = logger;
    }

    public Task SubscribeAsync(string connectionId, int userId, StreamWriter writer)
    {
        _connections.TryAdd(connectionId, (userId, writer));

        var userConns = _userConnections.GetOrAdd(userId, _ => new HashSet<string>());
        lock (userConns)
        {
            userConns.Add(connectionId);
        }

        _logger.LogInformation("User {UserId} subscribed with connection {ConnectionId}", userId, connectionId);
        return Task.CompletedTask;
    }

    public Task UnsubscribeAsync(string connectionId)
    {
        if (_connections.TryRemove(connectionId, out var connection))
        {
            var userConns = _userConnections.GetOrAdd(connection.UserId, _ => new HashSet<string>());
            lock (userConns)
            {
                userConns.Remove(connectionId);
            }
            _logger.LogInformation("User {UserId} unsubscribed connection {ConnectionId}", connection.UserId, connectionId);
        }
        return Task.CompletedTask;
    }

    public async Task NotifyPermissionChangedAsync(PermissionChangedEvent eventData)
    {
        var json = JsonSerializer.Serialize(eventData);
        var message = $"event: permissionChanged\ndata: {json}\n\n";
        await BroadcastAsync(message);
    }

    public async Task NotifyUserPermissionsChangedAsync(int userId, UserPermissionsUpdate update)
    {
        var json = JsonSerializer.Serialize(update);
        var message = $"event: userPermissionsChanged\ndata: {json}\n\n";

        if (_userConnections.TryGetValue(userId, out var connectionIds))
        {
            List<string> connectionsToRemove = new();

            lock (connectionIds)
            {
                foreach (var connectionId in connectionIds.ToList())
                {
                    if (_connections.TryGetValue(connectionId, out var connection))
                    {
                        try
                        {
                            await connection.Writer.WriteAsync(message);
                            await connection.Writer.FlushAsync();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to send message to connection {ConnectionId}", connectionId);
                            connectionsToRemove.Add(connectionId);
                        }
                    }
                }
            }

            // Cleanup dead connections
            foreach (var connId in connectionsToRemove)
            {
                await UnsubscribeAsync(connId);
            }
        }
    }

    public async Task BroadcastPermissionsChangedAsync(UserPermissionsUpdate update)
    {
        var json = JsonSerializer.Serialize(update);
        var message = $"event: permissionsUpdated\ndata: {json}\n\n";
        await BroadcastAsync(message);
    }

    private async Task BroadcastAsync(string message)
    {
        var deadConnections = new List<string>();

        foreach (var kvp in _connections)
        {
            try
            {
                await kvp.Value.Writer.WriteAsync(message);
                await kvp.Value.Writer.FlushAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to broadcast to connection {ConnectionId}", kvp.Key);
                deadConnections.Add(kvp.Key);
            }
        }

        foreach (var connId in deadConnections)
        {
            await UnsubscribeAsync(connId);
        }
    }

    public int GetConnectedUsersCount()
    {
        return _connections.Count;
    }
}
```

**Step 4: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Infrastructure/Services/Realtime/
git commit -m "feat(auth): implementar servicio de notificaciones SSE para permisos en tiempo real"
```

---

## Task 10: AuthController

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/AuthController.cs`
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/SseController.cs`

**Step 1: Crear AuthController**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/AuthController.cs
using Lefarma.API.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Auth;

[Route("api/[controller]")]
[ApiController]
[EndpointGroupName("Auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    [HttpPost("login-step-one")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Primer paso de login - verifica si requiere selección de dominio")]
    [SwaggerResponse(200, "OK", typeof(ApiResponse<LoginStepOneResponse>))]
    [SwaggerResponse(400, "Bad Request")]
    public async Task<ActionResult<ApiResponse<LoginStepOneResponse>>> LoginStepOne(
        [FromBody] LoginStepOneRequest request)
    {
        var result = await _authService.LoginStepOneAsync(request.Usuario);

        if (result == null)
        {
            return BadRequest(ApiResponse<LoginStepOneResponse>.Fail("No hay dominios configurados"));
        }

        return Ok(ApiResponse<LoginStepOneResponse>.Ok(result));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Login completo con Active Directory")]
    [SwaggerResponse(200, "OK", typeof(ApiResponse<LoginResponse>))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.LoginAsync(request, ipAddress, userAgent);

        if (result == null)
        {
            return Unauthorized(ApiResponse<LoginResponse>.Fail("Credenciales inválidas"));
        }

        return Ok(ApiResponse<LoginResponse>.Ok(result, "Login exitoso"));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    [SwaggerOperation(Summary = "Refrescar token de acceso")]
    [SwaggerResponse(200, "OK", typeof(ApiResponse<LoginResponse>))]
    [SwaggerResponse(401, "Unauthorized")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Refresh([FromBody] RefreshRequest request)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var userAgent = Request.Headers.UserAgent.ToString();

        var result = await _authService.RefreshTokenAsync(request.RefreshToken, ipAddress, userAgent);

        if (result == null)
        {
            return Unauthorized(ApiResponse<LoginResponse>.Fail("Token inválido o expirado"));
        }

        return Ok(ApiResponse<LoginResponse>.Ok(result, "Token refrescado"));
    }

    [HttpPost("logout")]
    [Authorize]
    [SwaggerOperation(Summary = "Cerrar sesión actual")]
    [SwaggerResponse(200, "OK", typeof(ApiResponse<bool>))]
    public async Task<ActionResult<ApiResponse<bool>>> Logout([FromBody] RefreshRequest request)
    {
        var result = await _authService.LogoutAsync(request.RefreshToken);
        return Ok(ApiResponse<bool>.Ok(result, "Sesión cerrada"));
    }

    [HttpPost("logout-all")]
    [Authorize]
    [SwaggerOperation(Summary = "Cerrar todas las sesiones del usuario")]
    [SwaggerResponse(200, "OK", typeof(ApiResponse<bool>))]
    public async Task<ActionResult<ApiResponse<bool>>> LogoutAll()
    {
        var userId = int.Parse(User.FindFirst("id_usuario")?.Value ?? "0");
        var result = await _authService.LogoutAllAsync(userId);
        return Ok(ApiResponse<bool>.Ok(result, "Todas las sesiones cerradas"));
    }

    [HttpGet("me")]
    [Authorize]
    [SwaggerOperation(Summary = "Obtener información del usuario autenticado")]
    [SwaggerResponse(200, "OK", typeof(ApiResponse<UserInfo>))]
    public ActionResult<ApiResponse<UserInfo>> GetCurrentUser()
    {
        var user = new UserInfo
        {
            Id = int.Parse(User.FindFirst("id_usuario")?.Value ?? "0"),
            Nombre = User.Identity?.Name ?? string.Empty,
            Correo = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
            Dominio = User.FindFirst("dominio")?.Value ?? string.Empty,
            Roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(r => r.Value).ToList(),
            Permisos = GetPermissionsFromClaims()
        };

        return Ok(ApiResponse<UserInfo>.Ok(user));
    }

    private List<string> GetPermissionsFromClaims()
    {
        var permisosClaim = User.FindFirst("permisos")?.Value;
        if (string.IsNullOrEmpty(permisosClaim))
            return new List<string>();

        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<List<string>>(permisosClaim) ?? new List<string>();
        }
        catch
        {
            return new List<string>();
        }
    }
}

public class LoginStepOneRequest
{
    public string Usuario { get; set; } = string.Empty;
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}
```

**Step 2: Crear SseController**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/SseController.cs
using Lefarma.API.Infrastructure.Services.Realtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Auth;

[Route("api/[controller]")]
[ApiController]
[EndpointGroupName("Auth")]
public class SseController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ILogger<SseController> _logger;

    public SseController(INotificationService notificationService, ILogger<SseController> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    [HttpGet("events")]
    [Authorize]
    [SwaggerOperation(Summary = "Conexión SSE para notificaciones en tiempo real")]
    public async Task Events(CancellationToken cancellationToken)
    {
        var userId = int.Parse(User.FindFirst("id_usuario")?.Value ?? "0");
        var connectionId = Guid.NewGuid().ToString();

        Response.Headers.Append("Content-Type", "text/event-stream");
        Response.Headers.Append("Cache-Control", "no-cache");
        Response.Headers.Append("Connection", "keep-alive");

        var writer = new StreamWriter(Response.Body);

        // Enviar mensaje de conexión inicial
        await writer.WriteAsync($"event: connected\ndata: {{\"connectionId\": \"{connectionId}\", \"userId\": {userId}}}\n\n");
        await writer.FlushAsync();

        await _notificationService.SubscribeAsync(connectionId, userId, writer);

        try
        {
            // Mantener la conexión abierta hasta que se cancele
            while (!cancellationToken.IsCancellationRequested)
            {
                // Enviar heartbeat cada 30 segundos
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
                await writer.WriteAsync($"event: heartbeat\ndata: {{\"time\": \"{DateTime.UtcNow:O}\"}}\n\n");
                await writer.FlushAsync();
            }
        }
        catch (OperationCanceledException)
        {
            // Conexión cerrada normalmente
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error en conexión SSE");
        }
        finally
        {
            await _notificationService.UnsubscribeAsync(connectionId);
        }
    }
}
```

**Step 3: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Features/Auth/AuthController.cs
git add lefarma.backend/src/Lefarma.API/Features/Auth/SseController.cs
git commit -m "feat(auth): crear controladores Auth y SSE"
```

---

## Task 11: Controladores Admin para Roles y Permisos

**Files:**
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/Admin/UsuariosController.cs`
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/Admin/RolesController.cs`
- Create: `lefarma.backend/src/Lefarma.API/Features/Auth/Admin/PermisosController.cs`

**Step 1: Crear RolesController**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/Admin/RolesController.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Lefarma.API.Infrastructure.Services.Realtime;
using Lefarma.API.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Auth.Admin;

[Route("api/admin/[controller]")]
[ApiController]
[Authorize(Roles = "Administrador")]
[EndpointGroupName("Admin")]
public class RolesController : ControllerBase
{
    private readonly IRolRepository _rolRepository;
    private readonly INotificationService _notificationService;

    public RolesController(IRolRepository rolRepository, INotificationService notificationService)
    {
        _rolRepository = rolRepository;
        _notificationService = notificationService;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los roles")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Rol>>>> GetAll()
    {
        var roles = await _rolRepository.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<Rol>>.Ok(roles));
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Obtener rol por ID")]
    public async Task<ActionResult<ApiResponse<Rol>>> GetById(int id)
    {
        var rol = await _rolRepository.GetByIdAsync(id);
        if (rol == null)
            return NotFound(ApiResponse<Rol>.Fail("Rol no encontrado"));

        return Ok(ApiResponse<Rol>.Ok(rol));
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Crear nuevo rol")]
    public async Task<ActionResult<ApiResponse<Rol>>> Create([FromBody] CreateRolRequest request)
    {
        var rol = new Rol
        {
            NombreRol = request.NombreRol,
            Descripcion = request.Descripcion
        };

        var created = await _rolRepository.CreateAsync(rol);
        return CreatedAtAction(nameof(GetById), new { id = created.IdRol },
            ApiResponse<Rol>.Ok(created, "Rol creado exitosamente"));
    }

    [HttpPut("{id}")]
    [SwaggerOperation(Summary = "Actualizar rol")]
    public async Task<ActionResult<ApiResponse<Rol>>> Update(int id, [FromBody] UpdateRolRequest request)
    {
        var rol = await _rolRepository.GetByIdAsync(id);
        if (rol == null)
            return NotFound(ApiResponse<Rol>.Fail("Rol no encontrado"));

        rol.NombreRol = request.NombreRol ?? rol.NombreRol;
        rol.Descripcion = request.Descripcion ?? rol.Descripcion;

        await _rolRepository.UpdateAsync(rol);
        return Ok(ApiResponse<Rol>.Ok(rol, "Rol actualizado"));
    }

    [HttpDelete("{id}")]
    [SwaggerOperation(Summary = "Eliminar rol (soft delete)")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        await _rolRepository.DeleteAsync(id);
        return Ok(ApiResponse<bool>.Ok(true, "Rol eliminado"));
    }

    [HttpPost("{id}/permisos/{idPermiso}")]
    [SwaggerOperation(Summary = "Asignar permiso a rol")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignPermiso(int id, int idPermiso)
    {
        await _rolRepository.AssignPermisoAsync(id, idPermiso);

        // Notificar cambio a todos los usuarios conectados
        await _notificationService.NotifyPermissionChangedAsync(new PermissionChangedEvent
        {
            EventType = "RolPermisoAsignado",
            RolCodigo = id.ToString(),
            PermisoCodigo = idPermiso.ToString()
        });

        return Ok(ApiResponse<bool>.Ok(true, "Permiso asignado al rol"));
    }

    [HttpDelete("{id}/permisos/{idPermiso}")]
    [SwaggerOperation(Summary = "Quitar permiso de rol")]
    public async Task<ActionResult<ApiResponse<bool>>> RemovePermiso(int id, int idPermiso)
    {
        await _rolRepository.RemovePermisoAsync(id, idPermiso);

        await _notificationService.NotifyPermissionChangedAsync(new PermissionChangedEvent
        {
            EventType = "RolPermisoRemovido",
            RolCodigo = id.ToString(),
            PermisoCodigo = idPermiso.ToString()
        });

        return Ok(ApiResponse<bool>.Ok(true, "Permiso removido del rol"));
    }
}

public class CreateRolRequest
{
    public string NombreRol { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}

public class UpdateRolRequest
{
    public string? NombreRol { get; set; }
    public string? Descripcion { get; set; }
}
```

**Step 2: Crear PermisosController**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/Admin/PermisosController.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Lefarma.API.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Auth.Admin;

[Route("api/admin/[controller]")]
[ApiController]
[Authorize(Roles = "Administrador")]
[EndpointGroupName("Admin")]
public class PermisosController : ControllerBase
{
    private readonly IPermisoRepository _permisoRepository;

    public PermisosController(IPermisoRepository permisoRepository)
    {
        _permisoRepository = permisoRepository;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los permisos")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Permiso>>>> GetAll()
    {
        var permisos = await _permisoRepository.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<Permiso>>.Ok(permisos));
    }

    [HttpGet("categoria/{categoria}")]
    [SwaggerOperation(Summary = "Obtener permisos por categoría")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Permiso>>>> GetByCategoria(string categoria)
    {
        var permisos = await _permisoRepository.GetByCategoriaAsync(categoria);
        return Ok(ApiResponse<IEnumerable<Permiso>>.Ok(permisos));
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Obtener permiso por ID")]
    public async Task<ActionResult<ApiResponse<Permiso>>> GetById(int id)
    {
        var permiso = await _permisoRepository.GetByIdAsync(id);
        if (permiso == null)
            return NotFound(ApiResponse<Permiso>.Fail("Permiso no encontrado"));

        return Ok(ApiResponse<Permiso>.Ok(permiso));
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Crear nuevo permiso")]
    public async Task<ActionResult<ApiResponse<Permiso>>> Create([FromBody] CreatePermisoRequest request)
    {
        var permiso = new Permiso
        {
            CodigoPermiso = request.CodigoPermiso,
            NombrePermiso = request.NombrePermiso,
            Descripcion = request.Descripcion,
            Categoria = request.Categoria,
            Recurso = request.Recurso,
            Accion = request.Accion
        };

        var created = await _permisoRepository.CreateAsync(permiso);
        return CreatedAtAction(nameof(GetById), new { id = created.IdPermiso },
            ApiResponse<Permiso>.Ok(created, "Permiso creado exitosamente"));
    }

    [HttpPut("{id}")]
    [SwaggerOperation(Summary = "Actualizar permiso")]
    public async Task<ActionResult<ApiResponse<Permiso>>> Update(int id, [FromBody] UpdatePermisoRequest request)
    {
        var permiso = await _permisoRepository.GetByIdAsync(id);
        if (permiso == null)
            return NotFound(ApiResponse<Permiso>.Fail("Permiso no encontrado"));

        permiso.NombrePermiso = request.NombrePermiso ?? permiso.NombrePermiso;
        permiso.Descripcion = request.Descripcion ?? permiso.Descripcion;
        permiso.Categoria = request.Categoria ?? permiso.Categoria;

        await _permisoRepository.UpdateAsync(permiso);
        return Ok(ApiResponse<Permiso>.Ok(permiso, "Permiso actualizado"));
    }

    [HttpDelete("{id}")]
    [SwaggerOperation(Summary = "Eliminar permiso (soft delete)")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        await _permisoRepository.DeleteAsync(id);
        return Ok(ApiResponse<bool>.Ok(true, "Permiso eliminado"));
    }
}

public class CreatePermisoRequest
{
    public string CodigoPermiso { get; set; } = string.Empty;
    public string NombrePermiso { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? Categoria { get; set; }
    public string? Recurso { get; set; }
    public string? Accion { get; set; }
}

public class UpdatePermisoRequest
{
    public string? NombrePermiso { get; set; }
    public string? Descripcion { get; set; }
    public string? Categoria { get; set; }
}
```

**Step 3: Crear UsuariosController**

```csharp
// lefarma.backend/src/Lefarma.API/Features/Auth/Admin/UsuariosController.cs
using Lefarma.API.Domain.Entities.Auth;
using Lefarma.API.Domain.Interfaces.Auth;
using Lefarma.API.Infrastructure.Services.Realtime;
using Lefarma.API.Shared.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Auth.Admin;

[Route("api/admin/[controller]")]
[ApiController]
[Authorize(Roles = "Administrador")]
[EndpointGroupName("Admin")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly INotificationService _notificationService;

    public UsuariosController(IUsuarioRepository usuarioRepository, INotificationService notificationService)
    {
        _usuarioRepository = usuarioRepository;
        _notificationService = notificationService;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los usuarios")]
    public async Task<ActionResult<ApiResponse<IEnumerable<Usuario>>>> GetAll()
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<Usuario>>.Ok(usuarios));
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Obtener usuario por ID")]
    public async Task<ActionResult<ApiResponse<Usuario>>> GetById(int id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
            return NotFound(ApiResponse<Usuario>.Fail("Usuario no encontrado"));

        return Ok(ApiResponse<Usuario>.Ok(usuario));
    }

    [HttpPost("{id}/roles/{idRol}")]
    [SwaggerOperation(Summary = "Asignar rol a usuario")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignRol(int id, int idRol, [FromQuery] DateTime? fechaExpiracion)
    {
        await _usuarioRepository.AssignRolAsync(id, idRol, fechaExpiracion);

        // Notificar al usuario específico
        await _notificationService.NotifyUserPermissionsChangedAsync(id, new UserPermissionsUpdate
        {
            UserId = id,
            Reason = "Rol asignado"
        });

        return Ok(ApiResponse<bool>.Ok(true, "Rol asignado al usuario"));
    }

    [HttpDelete("{id}/roles/{idRol}")]
    [SwaggerOperation(Summary = "Quitar rol de usuario")]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveRol(int id, int idRol)
    {
        await _usuarioRepository.RemoveRolAsync(id, idRol);

        await _notificationService.NotifyUserPermissionsChangedAsync(id, new UserPermissionsUpdate
        {
            UserId = id,
            Reason = "Rol removido"
        });

        return Ok(ApiResponse<bool>.Ok(true, "Rol removido del usuario"));
    }

    [HttpPost("{id}/permisos/{idPermiso}")]
    [SwaggerOperation(Summary = "Asignar permiso directo a usuario")]
    public async Task<ActionResult<ApiResponse<bool>>> AssignPermiso(int id, int idPermiso, [FromQuery] bool conceder = true)
    {
        await _usuarioRepository.AssignPermisoAsync(id, idPermiso, conceder);

        await _notificationService.NotifyUserPermissionsChangedAsync(id, new UserPermissionsUpdate
        {
            UserId = id,
            Reason = "Permiso asignado"
        });

        return Ok(ApiResponse<bool>.Ok(true, "Permiso asignado al usuario"));
    }

    [HttpDelete("{id}/permisos/{idPermiso}")]
    [SwaggerOperation(Summary = "Quitar permiso directo de usuario")]
    public async Task<ActionResult<ApiResponse<bool>>> RemovePermiso(int id, int idPermiso)
    {
        await _usuarioRepository.RemovePermisoAsync(id, idPermiso);

        await _notificationService.NotifyUserPermissionsChangedAsync(id, new UserPermissionsUpdate
        {
            UserId = id,
            Reason = "Permiso removido"
        });

        return Ok(ApiResponse<bool>.Ok(true, "Permiso removido del usuario"));
    }
}
```

**Step 4: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Features/Auth/Admin/
git commit -m "feat(auth): crear controladores admin para gestión de roles, permisos y usuarios"
```

---

## Task 12: Configuración en Program.cs

**Files:**
- Modify: `lefarma.backend/src/Lefarma.API/Program.cs`

**Step 1: Agregar configuración JWT en appsettings.Development.json**

```json
// lefarma.backend/src/Lefarma.API/appsettings.Development.json
{
  "JwtSettings": {
    "Issuer": "LefarmaAPI",
    "Audience": "LefarmaClient",
    "SecretKey": "your-super-secret-key-with-at-least-32-characters-long",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationMinutes": 43200
  }
}
```

**Step 2: Actualizar Program.cs**

```csharp
// lefarma.backend/src/Lefarma.API/Program.cs
// Agregar estos using
using Lefarma.API.Domain.Interfaces.Auth;
using Lefarma.API.Infrastructure.Data.Repositories.Auth;
using Lefarma.API.Features.Auth;
using Lefarma.API.Infrastructure.Services.Auth;
using Lefarma.API.Infrastructure.Services.Ldap;
using Lefarma.API.Infrastructure.Services.Realtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

// ...

var builder = WebApplication.CreateBuilder(args);

// Configuración JWT
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Registrar servicios de Auth
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IRolRepository, RolRepository>();
builder.Services.AddScoped<IPermisoRepository, PermisoRepository>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<ILdapService, LdapService>();

// Servicio de notificaciones SSE (singleton para mantener estado)
builder.Services.AddSingleton<INotificationService, SseNotificationService>();

// ...

// En el middleware pipeline, agregar antes de app.UseAuthorization():
app.UseAuthentication();
app.UseAuthorization();
```

**Step 3: Commit**

```bash
git add lefarma.backend/src/Lefarma.API/Program.cs
git add lefarma.backend/src/Lefarma.API/appsettings.Development.json
git commit -m "feat(auth): configurar JWT, autenticación y autorización en Program.cs"
```

---

## Task 13: Actualizar Frontend para SSE

**Files:**
- Modify: `lefarma.frontend/src/services/authService.ts`
- Modify: `lefarma.frontend/src/store/authStore.ts`
- Create: `lefarma.frontend/src/services/sseService.ts`

**Step 1: Crear sseService.ts**

```typescript
// lefarma.frontend/src/services/sseService.ts
import { useAuthStore } from '@/store/authStore';

class SseService {
  private eventSource: EventSource | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly reconnectDelay = 5000;

  connect() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // SSE no soporta headers, usamos query param o cookie
    this.eventSource = new EventSource(`${apiUrl}/sse/events`, {
      withCredentials: true
    });

    this.eventSource.onopen = () => {
      console.log('SSE connection established');
    };

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('SSE message:', data);
    };

    this.eventSource.addEventListener('connected', (event) => {
      console.log('Connected to SSE:', JSON.parse(event.data));
    });

    this.eventSource.addEventListener('heartbeat', (event) => {
      console.debug('SSE heartbeat:', JSON.parse(event.data));
    });

    this.eventSource.addEventListener('permissionChanged', (event) => {
      const data = JSON.parse(event.data);
      console.log('Permission changed:', data);
      // Recargar permisos del usuario
      this.refreshUserPermissions();
    });

    this.eventSource.addEventListener('userPermissionsChanged', (event) => {
      const data = JSON.parse(event.data);
      console.log('User permissions changed:', data);
      // Actualizar permisos en el store
      useAuthStore.getState().updatePermissions(data.permisos || [], data.roles || []);
    });

    this.eventSource.addEventListener('permissionsUpdated', (event) => {
      const data = JSON.parse(event.data);
      console.log('Permissions updated:', data);
      // Recargar permisos del usuario actual
      this.refreshUserPermissions();
    });

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource?.close();

      // Reconnect after delay
      this.reconnectTimeout = setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);
    };
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.eventSource?.close();
    this.eventSource = null;
  }

  private async refreshUserPermissions() {
    const authStore = useAuthStore.getState();
    await authStore.refreshToken();
  }
}

export const sseService = new SseService();
```

**Step 2: Actualizar authStore.ts**

```typescript
// lefarma.frontend/src/store/authStore.ts
// Agregar método updatePermissions

interface AuthState {
  // ... existing properties

  updatePermissions: (permisos: string[], roles: string[]) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing implementation

  updatePermissions: (permisos: string[], roles: string[]) => {
    set((state) => ({
      user: state.user ? {
        ...state.user,
        permisos,
        roles
      } : null
    }));
  },

  // En login exitoso, conectar SSE
  login: async (credentials) => {
    // ... existing login code

    // Después de login exitoso
    const { sseService } = await import('@/services/sseService');
    sseService.connect();
  },

  // En logout, desconectar SSE
  logout: () => {
    const { sseService } = await import('@/services/sseService');
    sseService.disconnect();
    // ... resto del logout
  }
}));
```

**Step 3: Actualizar App.tsx para conectar SSE al iniciar**

```typescript
// lefarma.frontend/src/App.tsx
import { useEffect } from 'react';
import { sseService } from '@/services/sseService';
import { useAuthStore } from '@/store/authStore';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      sseService.connect();
    }

    return () => {
      sseService.disconnect();
    };
  }, [isAuthenticated]);

  // ... resto del componente
}
```

**Step 4: Commit**

```bash
git add lefarma.frontend/src/services/sseService.ts
git add lefarma.frontend/src/store/authStore.ts
git add lefarma.frontend/src/App.tsx
git commit -m "feat(auth): implementar cliente SSE en frontend para notificaciones realtime"
```

---

## Task 14: Pruebas y Verificación

**Step 1: Verificar compilación del backend**

```bash
cd lefarma.backend/src/Lefarma.API
dotnet build
```

Expected: Build exitoso sin errores

**Step 2: Verificar frontend**

```bash
cd lefarma.frontend
npm run build
```

Expected: Build exitoso sin errores

**Step 3: Probar endpoints de autenticación**

```bash
# Iniciar backend
dotnet run --urls "http://localhost:5000"

# En otra terminal, probar login
curl -X POST http://localhost:5000/api/auth/login-step-one \
  -H "Content-Type: application/json" \
  -d '{"usuario": "testuser"}'

# Probar login completo (requiere AD configurado)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "testuser", "password": "password", "dominio": "CORP"}'
```

**Step 4: Verificar SSE**

```bash
# Con token válido, probar SSE
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/sse/events
```

Expected: Conexión SSE establecida, recibe evento "connected"

**Step 5: Commit final**

```bash
git commit -m "feat(auth): sistema completo de autenticación con roles, permisos y SSE realtime"
```

---

## Resumen de Archivos Creados/Modificados

### Backend

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `Domain/Entities/Auth/*.cs` | Create | 10 entidades de autenticación |
| `Infrastructure/Data/Configurations/Auth/*.cs` | Create | 10 configuraciones EF Core |
| `Infrastructure/Data/Migrations/*AddAuthTables*.cs` | Create | Migración de base de datos |
| `Infrastructure/Data/Seed/AuthSeedData.cs` | Create | Seed data inicial |
| `Domain/Interfaces/Auth/*.cs` | Create | 4 interfaces de repositorios |
| `Infrastructure/Data/Repositories/Auth/*.cs` | Create | 4 implementaciones de repositorios |
| `Infrastructure/Services/Ldap/*.cs` | Create | Servicio LDAP para AD |
| `Infrastructure/Services/Auth/*.cs` | Create | Servicio de tokens JWT |
| `Infrastructure/Services/Realtime/*.cs` | Create | Servicio SSE |
| `Features/Auth/*.cs` | Create | Servicios y controladores de auth |
| `Features/Auth/Admin/*.cs` | Create | Controladores de administración |
| `Program.cs` | Modify | Configuración JWT y DI |
| `appsettings.Development.json` | Modify | Configuración JWT |

### Frontend

| Archivo | Tipo | Descripción |
|---------|------|-------------|
| `src/services/sseService.ts` | Create | Servicio SSE |
| `src/store/authStore.ts` | Modify | Métodos para SSE |
| `src/App.tsx` | Modify | Conexión SSE automática |

---

## Ejecución

**Plan complete and saved to `docs/plans/2025-02-24-sistema-login-permisos-realtime.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
