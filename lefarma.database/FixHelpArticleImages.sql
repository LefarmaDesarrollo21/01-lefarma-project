-- ============================================================================
-- Lefarma - Script de corrección de imágenes en artículos de Help
-- Convierte texto plano [Imagen: alt](url) a nodos JSON de imagen Lexical
-- ============================================================================

USE Lefarma;
GO

-- ============================================================================
-- PASO 1: Verificar artículos afectados
-- ============================================================================
PRINT 'Verificando artículos con imágenes en texto plano...';
PRINT '';

SELECT 
    id,
    titulo,
    CASE 
        WHEN contenido LIKE '%\[Imagen:%' THEN 'Contiene patrón [Imagen:'
        WHEN contenido LIKE '%](/media/%' THEN 'Contiene URL /media/'
        ELSE 'Otro patrón'
    END AS tipo_problema,
    LEN(contenido) AS longitud_contenido
FROM [help].HelpArticles
WHERE contenido LIKE '%\[Imagen:%' 
   OR contenido LIKE '%](/media/%';
GO

-- ============================================================================
-- PASO 2: Mostrar ejemplos de contenido problemático
-- ============================================================================
PRINT '';
PRINT 'Ejemplos de contenido que será corregido:';
PRINT '==========================================';

-- Mostrar fragmentos del contenido problemático
SELECT 
    id,
    titulo,
    SUBSTRING(
        contenido,
        PATINDEX('%\[Imagen:%', contenido),
        CASE 
            WHEN PATINDEX('%\[Imagen:%', contenido) > 0 
            THEN CHARINDEX(')', contenido, PATINDEX('%\[Imagen:%', contenido)) - PATINDEX('%\[Imagen:%', contenido) + 1
            ELSE 100
        END
    ) AS fragmento_imagen
FROM [help].HelpArticles
WHERE contenido LIKE '%\[Imagen:%';
GO

-- ============================================================================
-- PASO 3: Función auxiliar para convertir patrón de imagen a nodo JSON
-- ============================================================================
IF OBJECT_ID('tempdb..#FixImageArticles') IS NOT NULL DROP TABLE #FixImageArticles;

-- Crear tabla temporal para almacenar los nuevos contenidos
CREATE TABLE #FixImageArticles (
    id INT PRIMARY KEY,
    contenido_nuevo NVARCHAR(MAX)
);

PRINT '';
PRINT 'Procesando artículos...';
PRINT '';

-- ============================================================================
-- PASO 4: Procesar cada artículo
-- ============================================================================
DECLARE @id INT;
DECLARE @contenido NVARCHAR(MAX);
DECLARE @nuevoContenido NVARCHAR(MAX);
DECLARE @posicionInicio INT;
DECLARE @posicionFin INT;
DECLARE @patronCompleto NVARCHAR(MAX);
DECLARE @altText NVARCHAR(MAX);
DECLARE @url NVARCHAR(MAX);
DECLARE @nuevaUrl NVARCHAR(MAX);
DECLARE @nodoImagen NVARCHAR(MAX);

DECLARE articulos_cursor CURSOR FOR
SELECT id, contenido
FROM [help].HelpArticles
WHERE contenido LIKE '%\[Imagen:%' 
   OR contenido LIKE '%](/media/%';

OPEN articulos_cursor;
FETCH NEXT FROM articulos_cursor INTO @id, @contenido;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @nuevoContenido = @contenido;
    
    -- Buscar y reemplazar todos los patrones [Imagen: alt](url)
    WHILE CHARINDEX('[Imagen:', @nuevoContenido) > 0
    BEGIN
        SET @posicionInicio = CHARINDEX('[Imagen:', @nuevoContenido);
        SET @posicionFin = CHARINDEX(')', @nuevoContenido, @posicionInicio);
        
        IF @posicionFin > @posicionInicio
        BEGIN
            -- Extraer el patrón completo: [Imagen: alt](url)
            SET @patronCompleto = SUBSTRING(@nuevoContenido, @posicionInicio, @posicionFin - @posicionInicio + 1);
            
            -- Extraer alt text (entre [Imagen: y ])
            SET @altText = SUBSTRING(
                @patronCompleto,
                CHARINDEX('[Imagen:', @patronCompleto) + 8,
                CHARINDEX(']', @patronCompleto) - CHARINDEX('[Imagen:', @patronCompleto) - 8
            );
            
            -- Extraer URL (entre ( y ))
            SET @url = SUBSTRING(
                @patronCompleto,
                CHARINDEX('](', @patronCompleto) + 2,
                LEN(@patronCompleto) - CHARINDEX('](', @patronCompleto) - 2
            );
            
            -- Corregir URL: /media/ -> /api/media/
            IF @url LIKE '/media/%'
                SET @nuevaUrl = '/api/' + SUBSTRING(@url, 2, LEN(@url) - 1);
            ELSE
                SET @nuevaUrl = @url;
            
            -- Escapar caracteres especiales para JSON
            SET @altText = REPLACE(REPLACE(REPLACE(@altText, '\', '\\'), '"', '\"'), CHAR(10), '\n');
            SET @nuevaUrl = REPLACE(REPLACE(REPLACE(@nuevaUrl, '\', '\\'), '"', '\"'), CHAR(10), '\n');
            
            -- Crear nodo de imagen JSON
            SET @nodoImagen = '{"type":"image","version":1,"src":"' + @nuevaUrl + '","altText":"' + @altText + '"}';
            
            -- Reemplazar en el contenido
            SET @nuevoContenido = REPLACE(@nuevoContenido, @patronCompleto, @nodoImagen);
            
            PRINT '  - Artículo ' + CAST(@id AS NVARCHAR(10)) + ': Convertido "' + @altText + '" -> ' + @nuevaUrl;
        END
        ELSE
        BEGIN
            -- Si no encontramos el patrón completo, salir del loop
            BREAK;
        END
    END
    
    -- También corregir URLs sueltas que no tengan el patrón [Imagen:]
    IF @nuevoContenido LIKE '%](/media/%' AND CHARINDEX('[Imagen:', @nuevoContenido) = 0
    BEGIN
        SET @nuevoContenido = REPLACE(@nuevoContenido, '](/media/', '](/api/media/');
        PRINT '  - Artículo ' + CAST(@id AS NVARCHAR(10)) + ': URLs /media/ corregidas a /api/media/';
    END
    
    -- Guardar en tabla temporal
    INSERT INTO #FixImageArticles (id, contenido_nuevo)
    VALUES (@id, @nuevoContenido);
    
    FETCH NEXT FROM articulos_cursor INTO @id, @contenido;
END

CLOSE articulos_cursor;
DEALLOCATE articulos_cursor;

PRINT '';
PRINT 'Actualizando artículos en la base de datos...';
PRINT '';

-- ============================================================================
-- PASO 5: Actualizar los artículos
-- ============================================================================
UPDATE ha
SET ha.contenido = f.contenido_nuevo,
    ha.fecha_actualizacion = GETUTCDATE(),
    ha.actualizado_por = 'script-fix-images'
FROM [help].HelpArticles ha
INNER JOIN #FixImageArticles f ON ha.id = f.id;

PRINT CAST(@@ROWCOUNT AS NVARCHAR(10)) + ' artículos actualizados.';
GO

-- ============================================================================
-- PASO 6: Verificar resultados
-- ============================================================================
PRINT '';
PRINT 'Verificación post-corrección:';
PRINT '==============================';

-- Verificar que ya no quedan patrones de texto plano
SELECT 
    id,
    titulo,
    CASE 
        WHEN contenido LIKE '%\[Imagen:%' THEN 'AÚN CONTIENE [Imagen:'
        ELSE 'Corregido'
    END AS estado
FROM [help].HelpArticles ha
WHERE EXISTS (SELECT 1 FROM #FixImageArticles f WHERE f.id = ha.id);

-- Mostrar algunos ejemplos de nodos de imagen creados
PRINT '';
PRINT 'Ejemplos de nodos de imagen creados:';
PRINT '====================================';

SELECT 
    id,
    titulo,
    CASE 
        WHEN CHARINDEX('"type":"image"', contenido) > 0 
        THEN SUBSTRING(
            contenido,
            CHARINDEX('"type":"image"', contenido) - 30,
            150
        )
        ELSE 'Sin imagen'
    END AS nodo_imagen_ejemplo
FROM [help].HelpArticles
WHERE contenido LIKE '%"type":"image"%';
GO

-- ============================================================================
-- Limpieza
-- ============================================================================
IF OBJECT_ID('tempdb..#FixImageArticles') IS NOT NULL DROP TABLE #FixImageArticles;

PRINT '';
PRINT '====================================';
PRINT '✓ Script completado';
PRINT '====================================';
GO

-- ============================================================================
-- NOTA: Estructura del nodo de imagen Lexical
-- ============================================================================
/*
Antes (texto plano):
[Imagen: logo.png](/media/help/2026/03/abc123.png)

Después (nodo JSON):
{"type":"image","version":1,"src":"/api/media/help/2026/03/abc123.png","altText":"logo.png"}

El nodo de imagen debe ir en el array "children" del JSON de Lexical, por ejemplo:
{
  "root": {
    "children": [
      {
        "children": [
          {"type":"text","text":"Texto antes de la imagen..."}
        ],
        "type":"paragraph"
      },
      {
        "children": [
          {"type":"image","version":1,"src":"/api/media/...","altText":"..."}
        ],
        "type":"paragraph"
      }
    ],
    "type":"root"
  }
}

NOTA IMPORTANTE: Este script reemplaza el texto plano directamente en el JSON.
Si el texto está dentro de un nodo de texto, puede ser necesario dividir el párrafo.
Para casos más complejos, considerar procesar en la aplicación (C#/TypeScript).
*/
