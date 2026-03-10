---
name: sql-executor
description: Executes SQL queries against SQL Server databases for testing and validation. Use when the user wants to run SQL queries, test database changes, validate queries, or check database state.
---

# SQL Executor

Execute SQL queries against SQL Server for testing and validation.

## CRITICAL: Always Ask for Database First

When the user asks to execute a SQL query, **ALWAYS ask which database to use** before executing. Present the available databases and wait for user selection.

## Available Databases

| Alias                        | Server      | Database               | User              |
| ---------------------------- | ----------- | ---------------------- | ----------------- |
| **cnnArtricenterProduccion** | 192.168.4.2 | Artricenter_Produccion | sisco1            |
| **cnnAsistencias**           | 192.168.1.5 | Asistencias            | sisco2Asistencias |
| **cnnAsokam**                | 192.168.4.2 | Asokam                 | coreapi           |
| **cnnLefarma**               | 192.168.4.2 | Lefarma                | coreapi           |

### Connection Strings (for reference)

```
cnnArtricenterProduccion:
Server=192.168.4.2;Database=Artricenter_Produccion;User Id=sisco1;Password=L3f5rm5$$001;Connection Timeout=360;TrustServerCertificate=true;Encrypt=false

cnnAsistencias:
Server=192.168.1.5;Database=Asistencias;User Id=sisco2Asistencias;Password=L3f5rm5$$001;Connection Timeout=360;TrustServerCertificate=true;Encrypt=false

cnnAsokam:
Server=192.168.4.2;Database=Asokam;User Id=coreapi;Password=L4_CL4VE_S3cReta_Y_sUp3r__SEGUR4_123!;Connection Timeout=360;TrustServerCertificate=true;Encrypt=false

cnnLefarma:
Server=192.168.4.2;Database=Lefarma;User Id=coreapi;Password=L4_CL4VE_S3cReta_Y_sUp3r__SEGUR4_123!;Connection Timeout=360;TrustServerCertificate=true;Encrypt=false
```

## Workflow

1. **User asks to run SQL query**
2. **Ask**: "¿En qué base de datos quieres ejecutar la consulta?" (show options above)
3. **Wait for user response**
4. **Execute query** on selected database
5. **Show results**

## Execute Query

### Using sqlcmd

```powershell
# Artricenter Produccion
sqlcmd -S 192.168.4.2 -d Artricenter_Produccion -U sisco1 -P "L3f5rm5$$001" -Q "SELECT * FROM tabla"

# Asistencias
sqlcmd -S 192.168.1.5 -d Asistencias -U sisco2Asistencias -P "L3f5rm5$$001" -Q "SELECT * FROM tabla"

# Asokam
sqlcmd -S 192.168.4.2 -d Asokam -U coreapi -P "L4_CL4VE_S3cReta_Y_sUp3r__SEGUR4_123!" -Q "SELECT * FROM tabla"
```

### Using PowerShell Script

```powershell
.\execute-sql.ps1 -Database Artricenter_Produccion -Query "SELECT * FROM tabla"
```

## Common Queries

### Check Database State

```sql
-- List all tables
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'

-- List all views
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS

-- Check table schema
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'NombreTabla'
```

### Check Foreign Keys

```sql
-- Get all foreign keys
SELECT
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    cp.name AS ParentColumn,
    tr.name AS ReferencedTable,
    cr.name AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
INNER JOIN sys.columns cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
```

## Best Practices

1. **ALWAYS ask which database first**
2. Use transactions for UPDATE/DELETE
3. Check query execution plans for performance
4. Backup data before running destructive queries
5. Use parameterized queries to prevent SQL injection

## Utility Scripts

### check_tables.ps1 - Check for LDAP Auth Tables

Checks for domain configuration and identity tables in Asokam database.

```powershell
$connectionString = "Server=192.168.4.2;Database=Asokam;User Id=coreapi;Password=L4_CL4VE_S3cRta_Y_sUp3r__SEGUR4_123!;Connection Timeout=30;TrustServerCertificate=true;Encrypt=false"
$query = @"
SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE '%Dominio%' OR TABLE_NAME = 'Usuarios' OR TABLE_NAME = 'Roles'
"@

$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
$adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
$dataset = New-Object System.Data.DataSet

try {
    $connection.Open()
    $adapter.Fill($dataset)
    $connection.Close()
    $dataset.Tables[0] | Format-Table -AutoSize
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
```

### test_view.ps1 - Test vwDirectorioActivo View

Tests the Active Directory view in Lefarma database.

```powershell
$connectionString = "Server=192.168.4.2;Database=Lefarma;User Id=coreapi;Password=L4_CL4VE_S3cRta_Y_sUp3r__SEGUR4_123!;Connection Timeout=30;TrustServerCertificate=true;Encrypt=false"
$query = "SELECT TOP 5 * FROM vwDirectorioActivo"

$connection = New-Object System.Data.SqlClient.SqlConnection($connectionString)
$command = New-Object System.Data.SqlClient.SqlCommand($query, $connection)
$adapter = New-Object System.Data.SqlClient.SqlDataAdapter($command)
$dataset = New-Object System.Data.DataSet

try {
    $connection.Open()
    $adapter.Fill($dataset)
    $connection.Close()
    $dataset.Tables[0] | Format-Table -AutoSize
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
```
