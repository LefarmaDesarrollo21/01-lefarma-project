# Help System - Database Setup

## Overview

The Help & Support system requires two new tables in the SQL Server database:
- `help.HelpArticles` - Stores help documentation articles with Lexical JSON content
- `help.HelpImages` - Stores uploaded images for documentation

## Installation

### Step 1: Run SQL Script

Execute the SQL script to create the schema and tables:

```bash
# Using SQL Server CLI (if available)
sqlcmd -S <server> -d <database> -i Database/HelpSystem.sql

# OR manually run in SSMS/Azure Data Studio
# Open Database/HelpSystem.sql and execute
```

### Step 2: Verify Tables

After running the script, verify the tables exist:

```sql
SELECT * FROM help.HelpArticles
SELECT * FROM help.HelpImages
```

## Schema Details

### HelpArticles Table

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key (auto-increment) |
| Titulo | NVARCHAR(200) | Article title |
| Contenido | NVARCHAR(MAX) | Lexical editor JSON content |
| Resumen | NVARCHAR(500) | Summary for list views (optional) |
| Modulo | NVARCHAR(50) | Module: 'Catalogos', 'Auth', 'Notificaciones', etc. |
| Tipo | NVARCHAR(50) | Target audience: 'usuario', 'desarrollador', 'ambos' |
| Categoria | NVARCHAR(100) | Sub-category within module (optional) |
| Orden | INT | Display order within module |
| Activo | BIT | Soft delete flag (default: 1) |
| FechaCreacion | DATETIME2 | Creation timestamp (UTC) |
| FechaActualizacion | DATETIME2 | Last update timestamp (UTC) |
| CreadoPor | NVARCHAR(100) | Username who created |
| ActualizadoPor | NVARCHAR(100) | Username who last updated |

### HelpImages Table

| Column | Type | Description |
|--------|------|-------------|
| Id | INT | Primary key (auto-increment) |
| NombreOriginal | NVARCHAR(255) | Original filename |
| NombreArchivo | NVARCHAR(255) | Generated filename (GUID.ext) |
| RutaRelativa | NVARCHAR(500) | Path: /media/help/YYYY/MM/guid.ext |
| TamanhoBytes | BIGINT | File size in bytes |
| MimeType | NVARCHAR(100) | MIME type: image/png, image/jpeg, etc. |
| Ancho | INT | Image width in pixels (optional) |
| Alto | INT | Image height in pixels (optional) |
| FechaSubida | DATETIME2 | Upload timestamp (UTC) |
| SubidoPor | NVARCHAR(100) | Username who uploaded |

## Indexes

The following indexes are created for performance:

```sql
-- HelpArticles
IX_HelpArticles_Modulo_Activo (Modulo, Activo)
IX_HelpArticles_Tipo_Activo (Tipo, Activo)
IX_HelpArticles_Categoria_Activo (Categoria, Activo)

-- HelpImages
IX_HelpImages_NombreArchivo (NombreArchivo)
IX_HelpImages_FechaSubida (FechaSubida DESC)
```

## Sample Data (Optional)

The SQL script includes commented-out sample data. Uncomment and run if needed:

```sql
/*
IF NOT EXISTS (SELECT * FROM [help].HelpArticles WHERE Modulo = 'Catalogos')
BEGIN
    INSERT INTO [help].HelpArticles (Titulo, Contenido, Resumen, Modulo, Tipo, Orden, CreadoPor)
    VALUES
    (N'Cómo crear una empresa', N'{...}', N'Aprende a crear una nueva empresa...', N'Catalogos', N'usuario', 1, N'admin'),
    ...
END
*/
```

## Notes

- **No EF Migrations Required**: The database uses manual SQL scripts, not EF migrations
- **Schema**: Tables are created in the `help` schema
- **Dates**: All dates use `DATETIME2` and are stored in UTC
- **Soft Delete**: The `Activo` flag is used for soft deletes (no hard deletes)

## Troubleshooting

### Error: Schema 'help' doesn't exist

The script automatically creates the schema. Ensure you have permissions:
```sql
GRANT CREATE SCHEMA TO [your_user]
```

### Error: Table already exists

```sql
-- Check if tables exist
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'help'

-- Drop if needed (WARNING: deletes all data)
DROP TABLE [help].HelpImages
DROP TABLE [help].HelpArticles
DROP SCHEMA [help]
```

## Next Steps

After database setup:
1. Task 2: Backend DTOs and Validators
2. Task 3: Repository Pattern
3. Task 4: Service Layer

See `docs/help-system-plan.md` for full implementation plan.
