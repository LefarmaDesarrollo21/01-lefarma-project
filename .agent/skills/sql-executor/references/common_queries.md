# Common SQL Queries for Lefarma

## Authentication & Users

### Check User Login
```sql
SELECT IdUsuario, NombreUsuario, Correo, IdRol, Activo
FROM app.Usuarios
WHERE NombreUsuario = 'username'
```

### Check User with Role
```sql
SELECT u.IdUsuario, u.NombreUsuario, r.NombreRol
FROM app.Usuarios u
INNER JOIN app.Roles r ON u.IdRol = r.IdRol
WHERE u.NombreUsuario = 'username'
```

## Catalogos (Business Catalogs)

### List All Catalogs
```sql
-- Empresas
SELECT * FROM app.Empresas

-- Sucursales
SELECT * FROM app.Sucursales

-- Áreas
SELECT * FROM app.Areas

-- Tipos de Gasto
SELECT * FROM app.Tipos Tipos de Medida
SELECT *Gasto

-- FROM app.TiposMedida

-- Unidades de Medida
SELECT * FROM app.UnidadesMedida
```

### Check Foreign Keys
```sql
-- Sucursales by Empresa
SELECT s.*, e.NombreEmpresa
FROM app.Sucursales s
INNER JOIN app.Empresas e ON s.IdEmpresa = e.IdEmpresa
```

## Permissions

### Check User Permissions
```sql
SELECT p.CodigoPermiso, p.NombrePermiso, p.Categoria
FROM app.Permisos p
INNER JOIN app.RolesPermisos rp ON p.IdPermiso = rp.IdPermiso
INNER JOIN app.Roles r ON rp.IdRol = r.IdRol
INNER JOIN app.Usuarios u ON u.IdRol = r.IdRol
WHERE u.NombreUsuario = 'username'
```

## Database Schema

### Get Table Row Counts
```sql
SELECT 
    t.NAME AS TableName,
    s.Name AS SchemaName,
    p.rows AS RowCounts
FROM sys.tables t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
INNER JOIN sys.partitions p ON t.object_id = p.object_id
WHERE p.index_id IN (0, 1)
ORDER BY rows DESC
```

### Get Column Details
```sql
SELECT 
    c.NAME AS ColumnName,
    t.NAME AS DataType,
    c.max_length,
    c.precision,
    c.scale,
    c.is_nullable,
    CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END AS IsPrimaryKey
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
LEFT JOIN (
    SELECT ku.TABLE_NAME, ku.COLUMN_NAME
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
    INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
    WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
) pk ON c.NAME = pk.COLUMN_NAME AND tc.TABLE_NAME = pk.TABLE_NAME
WHERE c.object_id = OBJECT_ID('app.Empresas')
ORDER BY c.column_id
```
