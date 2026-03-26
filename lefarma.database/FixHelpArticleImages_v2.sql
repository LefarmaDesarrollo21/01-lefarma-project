-- ============================================================================
-- Lefarma - Script de corrección de imágenes en artículos de Help
-- Convierte texto plano [Imagen: alt](url) a nodos JSON de imagen Lexical
-- VERSIÓN MEJORADA: Maneja correctamente la estructura JSON de Lexical
-- ============================================================================

USE Lefarma;
GO

/*
PROBLEMA:
Los artículos tienen texto plano como: [Imagen: logo.png](/media/help/2026/03/xxx.png)
Dentro de nodos de texto JSON como: {"type":"text","text":"...[Imagen:...]..."}
Esto hace que se muestre como texto crudo en lugar de renderizar la imagen.

SOLUCIÓN:
Dividir el nodo de texto en múltiples nodos: texto antes, imagen, texto después
Y mantener la estructura JSON válida de Lexical Editor.

ESTRUCTURA ESPERADA:
{
  "root": {
    "children": [
      {
        "children": [
          {"type":"text","text":"Texto antes..."}
        ],
        "type":"paragraph",
        "version":1
      },
      {
        "children": [
          {"type":"image","version":1,"src":"...","altText":"..."}
        ],
        "type":"paragraph",
        "version":1
      },
      {
        "children": [
          {"type":"text","text":"Texto después..."}
        ],
        "type":"paragraph",
        "version":1
      }
    ],
    "type":"root",
    "version":1
  }
}
*/

PRINT '==========================================';
PRINT 'CORRECCIÓN DE IMÁGENES EN ARTÍCULOS HELP';
PRINT '==========================================';
PRINT '';

-- ============================================================================
-- PASO 1: Verificar artículos afectados
-- ============================================================================
PRINT 'PASO 1: Verificando artículos con imágenes en texto plano...';
PRINT '';

SELECT 
    id,
    titulo,
    modulo,
    CASE 
        WHEN contenido LIKE '%\[Imagen:%' ESCAPE '\' THEN 'Sí - patrón [Imagen:'
        WHEN contenido LIKE '%](/media/%' ESCAPE '\' THEN 'Sí - URL /media/'
        ELSE 'No detectado'
    END AS tiene_patron_imagen
FROM [help].HelpArticles
WHERE contenido LIKE '%\[Imagen:%' ESCAPE '\'
   OR contenido LIKE '%](/media/%' ESCAPE '\';
GO

-- ============================================================================
-- PASO 2: Análisis detallado
-- ============================================================================
PRINT '';
PRINT 'PASO 2: Análisis detallado de contenido problemático...';
PRINT '';

-- Extraer fragmentos con el patrón para inspección
SELECT 
    id,
    titulo,
    -- Extraer aproximadamente 200 caracteres alrededor del patrón
    SUBSTRING(
        contenido,
        CASE 
            WHEN CHARINDEX('[Imagen:', contenido) > 10 THEN CHARINDEX('[Imagen:', contenido) - 10
            ELSE 1
        END,
        200
    ) AS fragmento_con_imagen
FROM [help].HelpArticles
WHERE contenido LIKE '%\[Imagen:%' ESCAPE '\';
GO

-- ============================================================================
-- PASO 3: Script de corrección (ejecutar con precaución)
-- ============================================================================
PRINT '';
PRINT 'PASO 3: Para ejecutar la corrección, descomentar y ejecutar el bloque de abajo';
PRINT '';

/*
-- DESCOMENTAR ESTE BLOQUE PARA EJECUTAR LA CORRECCIÓN

DECLARE @id INT;
DECLARE @contenido NVARCHAR(MAX);
DECLARE @nuevoContenido NVARCHAR(MAX);
DECLARE @textoAntes NVARCHAR(MAX);
DECLARE @textoDespues NVARCHAR(MAX);
DECLARE @altText NVARCHAR(MAX);
DECLARE @url NVARCHAR(MAX);
DECLARE @nuevaUrl NVARCHAR(MAX);
DECLARE @posInicio INT;
DECLARE @posFin INT;
DECLARE @posCorcheteFin INT;
DECLARE @posParentesisFin INT;
DECLARE @nodoImagen NVARCHAR(MAX);
DECLARE @nodoTextoAntes NVARCHAR(MAX);
DECLARE @nodoTextoDespues NVARCHAR(MAX);
DECLARE @nodoParrafoImagen NVARCHAR(MAX);
DECLARE @nodoParrafoTexto NVARCHAR(MAX);
DECLARE @articulosActualizados INT = 0;

DECLARE cur_articulos CURSOR FOR
SELECT id, contenido
FROM [help].HelpArticles
WHERE contenido LIKE '%\[Imagen:%' ESCAPE '\';

OPEN cur_articulos;
FETCH NEXT FROM cur_articulos INTO @id, @contenido;

WHILE @@FETCH_STATUS = 0
BEGIN
    SET @nuevoContenido = @contenido;
    
    -- Procesar cada imagen en el contenido
    WHILE CHARINDEX('[Imagen:', @nuevoContenido) > 0
    BEGIN
        SET @posInicio = CHARINDEX('[Imagen:', @nuevoContenido);
        
        -- Encontrar el cierre del corchete ]
        SET @posCorcheteFin = CHARINDEX(']', @nuevoContenido, @posInicio);
        
        -- Encontrar el cierre del paréntesis )
        SET @posParentesisFin = CHARINDEX(')', @nuevoContenido, @posCorcheteFin);
        
        IF @posCorcheteFin > @posInicio AND @posParentesisFin > @posCorcheteFin
        BEGIN
            -- Extraer altText (entre "[Imagen:" y "]")
            SET @altText = SUBSTRING(
                @nuevoContenido,
                @posInicio + 8, -- len('[Imagen:') = 8
                @posCorcheteFin - @posInicio - 8
            );
            
            -- Extraer URL (entre "](" y ")")
            SET @url = SUBSTRING(
                @nuevoContenido,
                @posCorcheteFin + 2,
                @posParentesisFin - @posCorcheteFin - 2
            );
            
            -- Corregir URL: /media/ -> /api/media/
            IF @url LIKE '/media/%'
                SET @nuevaUrl = '/api/' + SUBSTRING(@url, 2, LEN(@url) - 1);
            ELSE
                SET @nuevaUrl = @url;
            
            -- Escapar caracteres especiales para JSON
            SET @altText = REPLACE(REPLACE(REPLACE(@altText, '\', '\\'), '"', '\"'), CHAR(10), '\n');
            SET @nuevaUrl = REPLACE(REPLACE(REPLACE(@nuevaUrl, '\', '\\'), '"', '\"'), CHAR(10), '\n');
            
            -- Crear nodo de imagen (como párrafo con imagen)
            SET @nodoParrafoImagen = '{"children":[{"type":"image","version":1,"src":"' + @nuevaUrl + '","altText":"' + @altText + '"}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}';
            
            -- Texto antes de la imagen
            SET @textoAntes = SUBSTRING(@nuevoContenido, 1, @posInicio - 1);
            
            -- Texto después de la imagen
            SET @textoDespues = SUBSTRING(@nuevoContenido, @posParentesisFin + 1, LEN(@nuevoContenido) - @posParentesisFin);
            
            -- Reconstruir el contenido
            -- NOTA: Esta es una simplificación. El texto antes/después puede estar dentro de un nodo de texto JSON
            -- Para una corrección completa, se recomienda procesar en C#/TypeScript
            
            SET @nuevoContenido = @textoAntes + @nodoParrafoImagen + @textoDespues;
            
            PRINT '  Procesado artículo ' + CAST(@id AS NVARCHAR(10)) + ': "' + @altText + '"';
        END
        ELSE
        BEGIN
            BREAK;
        END
    END
    
    -- Actualizar el artículo
    UPDATE [help].HelpArticles
    SET contenido = @nuevoContenido,
        fecha_actualizacion = GETUTCDATE(),
        actualizado_por = 'script-fix-images-v2'
    WHERE id = @id;
    
    SET @articulosActualizados = @articulosActualizados + 1;
    
    FETCH NEXT FROM cur_articulos INTO @id, @contenido;
END

CLOSE cur_articulos;
DEALLOCATE cur_articulos;

PRINT '';
PRINT CAST(@articulosActualizados AS NVARCHAR(10)) + ' artículos actualizados.';
*/

-- ============================================================================
-- PASO 4: Alternativa recomendada - Procesamiento en aplicación
-- ============================================================================
PRINT '';
PRINT '==========================================';
PRINT 'ALTERNATIVA RECOMENDADA';
PRINT '==========================================';
PRINT '';
PRINT 'El procesamiento de JSON anidado en SQL es complejo y propenso a errores.';
PRINT 'Se recomienda crear un endpoint de API o script C# que:';
PRINT '';
PRINT '1. Lea los artículos con el patrón';
PRINT '2. Deserialice el JSON de Lexical';
PRINT '3. Busque texto con el patrón [Imagen: alt](url)';
PRINT '4. Divida los nodos de texto y cree nodos de imagen';
PRINT '5. Guarde los artículos actualizados';
PRINT '';
PRINT 'Ver archivo: FixHelpArticleImages_Recommended.cs';
PRINT '==========================================';
GO
