-- ============================================
-- Script: create-archivos-table.sql
-- Descripcion: Crea el schema y tabla para el Sistema de Gestion de Archivos
-- Fecha: 2026-03-26
-- ============================================

-- Crear schema si no existe
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'archivos')
BEGIN
    EXEC('CREATE SCHEMA archivos');
    PRINT 'Schema ''archivos'' creado exitosamente.';
END
ELSE
BEGIN
    PRINT 'Schema ''archivos'' ya existe.';
END
GO

-- Crear tabla Archivos si no existe
IF NOT EXISTS (SELECT * FROM sys.tables WHERE schema_id = SCHEMA_ID('archivos') AND name = 'Archivos')
BEGIN
    CREATE TABLE archivos.Archivos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        EntidadTipo NVARCHAR(100) NOT NULL,
        EntidadId INT NOT NULL,
        Carpeta NVARCHAR(500) NOT NULL,
        NombreOriginal NVARCHAR(255) NOT NULL,
        NombreFisico NVARCHAR(255) NOT NULL,
        Extension NVARCHAR(20) NOT NULL,
        TipoMime NVARCHAR(100) NOT NULL,
        TamanoBytes BIGINT NOT NULL,
        Metadata NVARCHAR(MAX) NULL,
        FechaCreacion DATETIME2 NOT NULL DEFAULT GETDATE(),
        FechaEdicion DATETIME2 NULL,
        UsuarioId INT NULL,
        Activo BIT NOT NULL DEFAULT 1
    );
    
    PRINT 'Tabla ''archivos.Archivos'' creada exitosamente.';
END
ELSE
BEGIN
    PRINT 'Tabla ''archivos.Archivos'' ya existe.';
END
GO

-- Crear indices
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Archivos_Entidad' AND object_id = OBJECT_ID('archivos.Archivos'))
BEGIN
    CREATE INDEX IX_Archivos_Entidad ON archivos.Archivos (EntidadTipo, EntidadId);
    PRINT 'Indice ''IX_Archivos_Entidad'' creado exitosamente.';
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Archivos_Carpeta' AND object_id = OBJECT_ID('archivos.Archivos'))
BEGIN
    CREATE INDEX IX_Archivos_Carpeta ON archivos.Archivos (Carpeta);
    PRINT 'Indice ''IX_Archivos_Carpeta'' creado exitosamente.';
END
GO

PRINT 'Script completado. Sistema de Gestion de Archivos listo.';
