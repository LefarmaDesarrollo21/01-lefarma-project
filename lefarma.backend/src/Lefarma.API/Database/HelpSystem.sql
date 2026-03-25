-- ============================================================================
-- Lefarma - Sistema de Ayuda y Soporte
-- Script de creación de tablas (SQL Server)
-- ============================================================================

USE Lefarma;
GO

-- ============================================================================
-- Tabla: HelpArticles
-- Almacena los artículos de documentación con contenido JSON de Lexical
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'help')
BEGIN
    EXECUTE('CREATE SCHEMA [help]');
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HelpArticles' AND schema_id = SCHEMA_ID('help'))
BEGIN
    CREATE TABLE [help].HelpArticles (
        [id]               INT IDENTITY(1,1) PRIMARY KEY,
        [titulo]           NVARCHAR(200) NOT NULL,
        [contenido]        NVARCHAR(MAX) NOT NULL,  -- JSON de Lexical
        [resumen]          NVARCHAR(500) NULL,      -- Para listados/cards
        [modulo]           NVARCHAR(50) NOT NULL,    -- 'Catalogos', 'Auth', 'Notificaciones', etc.
        [tipo]             NVARCHAR(50) NOT NULL,    -- 'usuario', 'desarrollador', 'ambos'
        [categoria]        NVARCHAR(100) NULL,       -- Sub-categoría dentro del módulo (opcional)
        [orden]            INT NOT NULL DEFAULT 0,   -- Para ordenar dentro del módulo
        [activo]           BIT NOT NULL DEFAULT 1,   -- Soft delete
        [fecha_creacion]    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [fecha_actualizacion] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [creado_por]        NVARCHAR(100) NULL,       -- Username
        [actualizado_por]   NVARCHAR(100) NULL        -- Username
    );

    -- Índices para búsquedas frecuentes
    CREATE NONCLUSTERED INDEX [IX_HelpArticles_modulo_activo]
        ON [help].HelpArticles([modulo], [activo]);

    CREATE NONCLUSTERED INDEX [IX_HelpArticles_tipo_activo]
        ON [help].HelpArticles([tipo], [activo]);

    CREATE NONCLUSTERED INDEX [IX_HelpArticles_categoria_activo]
        ON [help].HelpArticles([categoria], [activo])
        WHERE [categoria] IS NOT NULL;

    PRINT '✓ Tabla [help].HelpArticles creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠ Tabla [help].HelpArticles ya existe';
END
GO

-- ============================================================================
-- Tabla: HelpImages
-- Almacena información de imágenes subidas para la documentación
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HelpImages' AND schema_id = SCHEMA_ID('help'))
BEGIN
    CREATE TABLE [help].HelpImages (
        [id]               INT IDENTITY(1,1) PRIMARY KEY,
        [nombre_original]   NVARCHAR(255) NOT NULL,  -- Nombre original del archivo
        [nombre_archivo]    NVARCHAR(255) NOT NULL,  -- GUID.ext
        [ruta_relativa]     NVARCHAR(500) NOT NULL,  -- /media/help/2025/03/abc-123.png
        [tamano_bytes]     BIGINT NOT NULL,
        [mime_type]         NVARCHAR(100) NOT NULL,  -- image/png, image/jpeg, etc.
        [ancho]            INT NULL,                -- Ancho en pixeles (opcional)
        [alto]             INT NULL,                -- Alto en pixeles (opcional)
        [fecha_subida]      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [subido_por]        NVARCHAR(100) NULL       -- Username
    );

    -- Índices
    CREATE NONCLUSTERED INDEX [IX_HelpImages_nombre_archivo]
        ON [help].HelpImages([nombre_archivo]);

    CREATE NONCLUSTERED INDEX [IX_HelpImages_fecha_subida]
        ON [help].HelpImages([fecha_subida] DESC);

    PRINT '✓ Tabla [help].HelpImages creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠ Tabla [help].HelpImages ya existe';
END
GO

-- ============================================================================
-- Datos de ejemplo (opcional)
-- ============================================================================
-- Descomentar para insertar datos de prueba
/*
IF NOT EXISTS (SELECT * FROM [help].HelpArticles WHERE Modulo = 'Catalogos')
BEGIN
    INSERT INTO [help].HelpArticles (Titulo, Contenido, Resumen, Modulo, Tipo, Orden, CreadoPor)
    VALUES
    (N'Cómo crear una empresa', N'{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Este es un artículo de ejemplo sobre cómo crear una empresa en el sistema.\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}]}}', N'Aprende a crear una nueva empresa en el sistema LeFarma paso a paso.', N'Catalogos', N'usuario', 1, N'admin'),

    (N'Gestión de usuarios - Guía técnica', N'{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Documentación técnica sobre el sistema de usuarios y roles.\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}]}}', N'Guía técnica para desarrolladores sobre el sistema de autenticación y autorización.', N'Auth', N'desarrollador', 1, N'admin');

    PRINT '✓ Datos de ejemplo insertados';
END
*/
GO

PRINT '';
PRINT '====================================';
PRINT '✓ Script completado exitosamente';
PRINT '====================================';
PRINT 'Schema: [help]';
PRINT 'Tablas creadas:';
PRINT '  - [help].HelpArticles';
PRINT '  - [help].HelpImages';
PRINT '====================================';
GO
