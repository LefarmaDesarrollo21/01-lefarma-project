-- ============================================================================
-- Agregar columna 'modulo' a HelpArticles
-- La entidad HelpArticle tiene una propiedad 'Modulo' (string) que se usa
-- para filtrar sin JOIN, pero la tabla no tiene esta columna.
-- ============================================================================

USE Lefarma;
GO

-- Agregar columna modulo si no existe
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID('[help].HelpArticles') 
    AND name = 'modulo'
)
BEGIN
    ALTER TABLE [help].HelpArticles
    ADD [modulo] NVARCHAR(50) NOT NULL DEFAULT '';
    
    PRINT '✓ Columna [modulo] agregada a [help].HelpArticles';
END
ELSE
BEGIN
    PRINT '⚠ La columna [modulo] ya existe';
END
GO

-- Actualizar los registros existentes con el nombre del módulo desde la relación
UPDATE a
SET a.[modulo] = ISNULL(m.[nombre], '')
FROM [help].HelpArticles a
LEFT JOIN [help].HelpModules m ON a.[modulo_id] = m.[id]
WHERE a.[modulo] = '' OR a.[modulo] IS NULL;
GO

PRINT '✓ Datos de módulo actualizados';
GO
