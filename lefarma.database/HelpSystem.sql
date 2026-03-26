-- ============================================================================
-- Lefarma - Sistema de Ayuda y Soporte
-- Script de creación de tablas (SQL Server)
-- ============================================================================

USE Lefarma;
GO

-- ============================================================================
-- ELIMINAR TABLAS EXISTENTES (en orden por FKs)
-- ============================================================================
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'HelpArticles' AND schema_id = SCHEMA_ID('help'))
BEGIN
    DROP TABLE [help].HelpArticles;
    PRINT '✓ Tabla [help].HelpArticles eliminada';
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'HelpImages' AND schema_id = SCHEMA_ID('help'))
BEGIN
    DROP TABLE [help].HelpImages;
    PRINT '✓ Tabla [help].HelpImages eliminada';
END
GO

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'HelpModules' AND schema_id = SCHEMA_ID('help'))
BEGIN
    DROP TABLE [help].HelpModules;
    PRINT '✓ Tabla [help].HelpModules eliminada';
END
GO

-- ============================================================================
-- Crear Schema (si no existe)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'help')
BEGIN
    EXECUTE('CREATE SCHEMA [help]');
    PRINT '✓ Schema [help] creado';
END
GO

-- ============================================================================
-- Tabla: HelpModules
-- Almacena los módulos de documentación
-- ============================================================================
CREATE TABLE [help].HelpModules (
    [id]               INT IDENTITY(1,1) PRIMARY KEY,
    [nombre]           NVARCHAR(50) NOT NULL UNIQUE,
    [label]            NVARCHAR(100) NOT NULL,
    [orden]            INT NOT NULL DEFAULT 0,
    [activo]           BIT NOT NULL DEFAULT 1,
    [fecha_creacion]    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [fecha_actualizacion] DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE NONCLUSTERED INDEX [IX_HelpModules_orden_activo]
    ON [help].HelpModules([orden], [activo]);

PRINT '✓ Tabla [help].HelpModules creada';
GO

-- ============================================================================
-- Tabla: HelpArticles
-- Almacena los artículos de documentación con contenido JSON de Lexical
-- ============================================================================
CREATE TABLE [help].HelpArticles (
    [id]               INT IDENTITY(1,1) PRIMARY KEY,
    [titulo]           NVARCHAR(200) NOT NULL,
    [contenido]        NVARCHAR(MAX) NOT NULL,
    [resumen]          NVARCHAR(500) NULL,
    [modulo_id]        INT NULL,
    [modulo]           NVARCHAR(50) NOT NULL DEFAULT '',
    [tipo]             NVARCHAR(50) NOT NULL DEFAULT 'usuario',
    [categoria]        NVARCHAR(100) NULL,
    [orden]            INT NOT NULL DEFAULT 0,
    [activo]           BIT NOT NULL DEFAULT 1,
    [fecha_creacion]    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [fecha_actualizacion] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [creado_por]        NVARCHAR(100) NULL,
    [actualizado_por]   NVARCHAR(100) NULL,
    CONSTRAINT [FK_HelpArticles_HelpModules] FOREIGN KEY ([modulo_id])
        REFERENCES [help].HelpModules([id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [IX_HelpArticles_modulo_activo]
    ON [help].HelpArticles([modulo], [activo]);

CREATE NONCLUSTERED INDEX [IX_HelpArticles_modulo_id_activo]
    ON [help].HelpArticles([modulo_id], [activo]);

CREATE NONCLUSTERED INDEX [IX_HelpArticles_tipo_activo]
    ON [help].HelpArticles([tipo], [activo]);

CREATE NONCLUSTERED INDEX [IX_HelpArticles_categoria_activo]
    ON [help].HelpArticles([categoria], [activo])
    WHERE [categoria] IS NOT NULL;

PRINT '✓ Tabla [help].HelpArticles creada';
GO

-- ============================================================================
-- Tabla: HelpImages
-- Almacena información de imágenes subidas para la documentación
-- ============================================================================
CREATE TABLE [help].HelpImages (
    [id]               INT IDENTITY(1,1) PRIMARY KEY,
    [nombre_original]   NVARCHAR(255) NOT NULL,
    [nombre_archivo]    NVARCHAR(255) NOT NULL,
    [ruta_relativa]     NVARCHAR(500) NOT NULL,
    [tamano_bytes]     BIGINT NOT NULL,
    [mime_type]         NVARCHAR(100) NOT NULL,
    [ancho]            INT NULL,
    [alto]             INT NULL,
    [fecha_subida]      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    [subido_por]        NVARCHAR(100) NULL
);

CREATE NONCLUSTERED INDEX [IX_HelpImages_nombre_archivo]
    ON [help].HelpImages([nombre_archivo]);

CREATE NONCLUSTERED INDEX [IX_HelpImages_fecha_subida]
    ON [help].HelpImages([fecha_subida] DESC);

PRINT '✓ Tabla [help].HelpImages creada';
GO

-- ============================================================================
-- DATOS INICIALES (SEED)
-- ============================================================================

-- Módulos
INSERT INTO [help].HelpModules (nombre, label, orden) VALUES
('General', 'General', 1),
('Catalogos', 'Catálogos', 2),
('Auth', 'Autenticación', 3),
('Notificaciones', 'Notificaciones', 4),
('Profile', 'Perfil', 5),
('Admin', 'Administración', 6),
('SystemConfig', 'Configuración', 7);

PRINT '✓ Módulos iniciales insertados (7 registros)';
GO

-- Artículos de ejemplo
INSERT INTO [help].HelpArticles (titulo, contenido, resumen, modulo_id, modulo, tipo, categoria, orden, creado_por) VALUES
('Bienvenido al Sistema de Ayuda', '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Bienvenido al sistema de ayuda de Lefarma. Aquí encontrarás documentación sobre cómo usar cada módulo de la aplicación.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 'Guía de inicio para el sistema de ayuda', 1, 'General', 'usuario', 'Inicio', 1, 'sistema'),
('Gestión de Catálogos', '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"El módulo de Catálogos permite administrar los datos maestros de la empresa: Áreas, Empresas, Sucursales y Tipos de Gasto.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 'Administra los datos maestros', 2, 'Catalogos', 'usuario', 'Gestión', 1, 'sistema'),
('Cómo iniciar sesión', '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Para iniciar sesión, ingresa tu usuario y contraseña en la pantalla de login. Si tienes problemas, contacta al administrador.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 'Guía de autenticación', 3, 'Auth', 'usuario', 'Acceso', 1, 'sistema'),
('Arquitectura del Sistema', '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"El sistema está construido con .NET 10 en el backend y React con TypeScript en el frontend. Utiliza Entity Framework Core con SQL Server.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 'Documentación técnica de la arquitectura', 6, 'Admin', 'desarrollador', 'Técnico', 1, 'sistema'),
('API Endpoints - Catálogos', '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"GET /api/catalogos/areas - Lista todas las áreas\nPOST /api/catalogos/areas - Crea nueva área\nPUT /api/catalogos/areas/{id} - Actualiza área\nDELETE /api/catalogos/areas/{id} - Elimina área","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}', 'Referencia de API para módulo Catálogos', 2, 'Catalogos', 'desarrollador', 'API', 2, 'sistema');

PRINT '✓ Artículos de ejemplo insertados (5 registros)';
GO

-- Imágenes de ejemplo (vacío por ahora - se agregan via upload)
PRINT '✓ Tabla HelpImages lista para recibir imágenes';
GO

PRINT '';
PRINT '====================================';
PRINT '✓ Script completado exitosamente';
PRINT '====================================';
PRINT 'Schema: [help]';
PRINT 'Tablas creadas:';
PRINT '  - [help].HelpModules (7 módulos)';
PRINT '  - [help].HelpArticles (3 artículos)';
PRINT '  - [help].HelpImages';
PRINT '====================================';
GO
