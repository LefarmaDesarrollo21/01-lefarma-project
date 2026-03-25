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
        [Id]               INT IDENTITY(1,1) PRIMARY KEY,
        [Titulo]           NVARCHAR(200) NOT NULL,
        [Contenido]        NVARCHAR(MAX) NOT NULL,  -- JSON de Lexical
        [Resumen]          NVARCHAR(500) NULL,      -- Para listados/cards
        [Modulo]           NVARCHAR(50) NOT NULL,    -- 'Catalogos', 'Auth', 'Notificaciones', etc.
        [Tipo]             NVARCHAR(50) NOT NULL,    -- 'usuario', 'desarrollador', 'ambos'
        [Categoria]        NVARCHAR(100) NULL,       -- Sub-categoría dentro del módulo (opcional)
        [Orden]            INT NOT NULL DEFAULT 0,   -- Para ordenar dentro del módulo
        [Activo]           BIT NOT NULL DEFAULT 1,   -- Soft delete
        [FechaCreacion]    DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [FechaActualizacion] DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [CreadoPor]        NVARCHAR(100) NULL,       -- Username
        [ActualizadoPor]   NVARCHAR(100) NULL        -- Username
    );

    -- Índices para búsquedas frecuentes
    CREATE NONCLUSTERED INDEX [IX_HelpArticles_Modulo_Activo]
        ON [help].HelpArticles([Modulo], [Activo]);

    CREATE NONCLUSTERED INDEX [IX_HelpArticles_Tipo_Activo]
        ON [help].HelpArticles([Tipo], [Activo]);

    CREATE NONCLUSTERED INDEX [IX_HelpArticles_Categoria_Activo]
        ON [help].HelpArticles([Categoria], [Activo])
        WHERE [Categoria] IS NOT NULL;

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
        [Id]               INT IDENTITY(1,1) PRIMARY KEY,
        [NombreOriginal]   NVARCHAR(255) NOT NULL,  -- Nombre original del archivo
        [NombreArchivo]    NVARCHAR(255) NOT NULL,  -- GUID.ext
        [RutaRelativa]     NVARCHAR(500) NOT NULL,  -- /media/help/2025/03/abc-123.png
        [TamanhoBytes]     BIGINT NOT NULL,
        [MimeType]         NVARCHAR(100) NOT NULL,  -- image/png, image/jpeg, etc.
        [Ancho]            INT NULL,                -- Ancho en pixeles (opcional)
        [Alto]             INT NULL,                -- Alto en pixeles (opcional)
        [FechaSubida]      DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        [SubidoPor]        NVARCHAR(100) NULL       -- Username
    );

    -- Índices
    CREATE NONCLUSTERED INDEX [IX_HelpImages_NombreArchivo]
        ON [help].HelpImages([NombreArchivo]);

    CREATE NONCLUSTERED INDEX [IX_HelpImages_FechaSubida]
        ON [help].HelpImages([FechaSubida] DESC);

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
