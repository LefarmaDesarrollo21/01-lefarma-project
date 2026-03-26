USE Lefarma;
GO

-- Ver estructura de HelpArticles
SELECT c.name AS column_name, t.name AS data_type, c.max_length, c.is_nullable
FROM sys.columns c
JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('[help].HelpArticles')
ORDER BY c.column_id;
GO

-- Ver datos de ejemplo
SELECT TOP 3 id, titulo, modulo, modulo_id, tipo FROM [help].HelpArticles;
GO

-- Ver módulos
SELECT * FROM [help].HelpModules;
GO
