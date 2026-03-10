# Database Schemas Reference

This document indexes the tables from Core.DB databases.

## Artricenter_Produccion

Location: `C:\Users\brand\OneDrive\Desktop\workplace-win\dev\core-manager\Core.DB\Artricenter_Produccion_schema_20250704_164134.json`

### Key Schemas

#### agenda (Appointments/Scheduling)
- `servicios` - Medical services
- `servicio_sucursal` - Service-branch configuration
- `servicio_horario` - Service schedules
- `prestador` - Providers/doctors
- `niveles` - Service levels
- `empleado_prestador` - Employee-provider mapping
- `Control_Citax` - Appointments
- `CitasReservadas` - Reserved appointments
- `estados_citasx` - Appointment statuses
- `categorias_reglas` - Rule categories

#### catalogos (Business Catalogs)
- `sucursales` - Branches/locations
- (Other catalog tables)

#### dbo (Core tables)
- `tEmpleados` - Employees
- (Other core tables)

### Stored Procedures (agenda)
- `sp_actualizar_servicio` - Update service
- `sp_agendar_cita` - Schedule appointment
- `sp_cancelar_cita` - Cancel appointment
- `sp_dar_asistencia_cita` - Mark attendance
- `sp_get_agenda_dia` - Get daily schedule
- `sp_get_servicios` - Get services
- `sp_reservar_cita` - Reserve appointment

## Asistencias

Location: `C:\Users\brand\OneDrive\Desktop\workplace-win\dev\core-manager\Core.DB\Asistencias_schema_20250704_165635.json`

### Key Tables
- Employee attendance tracking tables
- Time management tables

## Asokam

Referenced in connection strings.

## IOAC

Location: `C:\Users\brand\OneDrive\Desktop\workplace-win\dev\core-manager\Core.DB\IOAC_schema_20250704_170215.json`

## Query Examples

### Check appointments for a patient
```sql
SELECT * FROM agenda.Control_Citax WHERE CT_IDPRO = @PacienteId
```

### Check available services
```sql
SELECT * FROM agenda.servicios WHERE activo = 1
```

### Check provider schedule
```sql
SELECT * FROM agenda.servicio_horario WHERE prestador_id = @PrestadorId
```
