-- Script para insertar el catálogo de Áreas
-- Ejecutar directamente en SQL Server Management Studio o via sqlcmd

USE Lefarma;
GO

-- Verificar si ya existen datos y evitar duplicados
IF NOT EXISTS (SELECT * FROM catalogos.areas WHERE nombre = 'Recursos Humanos')
BEGIN
    INSERT INTO catalogos.areas (nombre, nombre_normalizado, descripcion, descripcion_normalizada, clave, activo, fecha_creacion)
    VALUES
    ('Recursos Humanos', 'recursos humanos', 'Solicitar a RH', 'solicitar a rh', 'RH', 1, GETDATE()),
    ('Contabilidad', 'contabilidad', 'Por definir', 'por definir', 'CON', 1, GETDATE()),
    ('Tesoreria', 'tesoreria', 'Por definir', 'por definir', 'TES', 1, GETDATE()),
    ('Compras', 'compras', 'Por definir', 'por definir', 'COM', 1, GETDATE()),
    ('Almacen', 'almacen', 'Por definir', 'por definir', 'ALM', 1, GETDATE()),
    ('Produccion', 'produccion', 'Por definir', 'por definir', 'PRO', 1, GETDATE()),
    ('Ventas', 'ventas', 'Por definir', 'por definir', 'VEN', 1, GETDATE()),
    ('Marketing', 'marketing', 'Por definir', 'por definir', 'MKT', 1, GETDATE()),
    ('Tecnologia', 'tecnologia', 'Por definir', 'por definir', 'TEC', 1, GETDATE()),
    ('Calidad', 'calidad', 'Por definir', 'por definir', 'CAL', 1, GETDATE());

    PRINT '10 áreas insertadas exitosamente.';
END
ELSE
BEGIN
    PRINT 'Las áreas ya existen en la base de datos.';
END
GO

-- Mostrar las áreas insertadas
SELECT id_area, nombre, descripcion, clave, activo
FROM catalogos.areas
ORDER BY id_area;
GO
