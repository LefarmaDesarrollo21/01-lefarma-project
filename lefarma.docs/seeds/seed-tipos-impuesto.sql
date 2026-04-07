-- Seed: Tipos de Impuesto
-- Schema: catalogos.tipos_impuesto

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IVA 16%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IVA 16%', 'iva 16%', 0.16, 'T16', 'Impuesto al Valor Agregado 16%', 'impuesto al valor agregado 16%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IVA 8%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IVA 8%', 'iva 8%', 0.08, 'T08', 'Impuesto al Valor Agregado 8%', 'impuesto al valor agregado 8%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IVA 0%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IVA 0%', 'iva 0%', 0.00, 'T00', 'Impuesto al Valor Agregado 0%', 'impuesto al valor agregado 0%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'Exento')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('Exento', 'exento', 0.00, 'EXENTO', 'Exento de impuestos', 'exento de impuestos', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'ISR')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('ISR', 'isr', 0.30, 'ISR', 'Impuesto Sobre la Renta', 'impuesto sobre la renta', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'Sin Impuesto')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('Sin Impuesto', 'sin impuesto', 0.00, 'SINIMP', 'Sin impuesto aplicable', 'sin impuesto aplicable', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IEPS 8%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IEPS 8%', 'ieps 8%', 0.08, 'IEPS08', 'Impuesto Especial sobre Productos y Servicios 8%', 'impuesto especial sobre productos y servicios 8%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IEPS 26%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IEPS 26%', 'ieps 26%', 0.26, 'IEPS26', 'Impuesto Especial sobre Productos y Servicios 26%', 'impuesto especial sobre productos y servicios 26%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IEPS 30%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IEPS 30%', 'ieps 30%', 0.30, 'IEPS30', 'Impuesto Especial sobre Productos y Servicios 30%', 'impuesto especial sobre productos y servicios 30%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'IEPS 50%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('IEPS 50%', 'ieps 50%', 0.50, 'IEPS50', 'Impuesto Especial sobre Productos y Servicios 50%', 'impuesto especial sobre productos y servicios 50%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'ISH 3%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('ISH 3%', 'ish 3%', 0.03, 'ISH03', 'Impuesto sobre Hospedaje 3%', 'impuesto sobre hospedaje 3%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'Retención ISR 10%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('Retención ISR 10%', 'retencion isr 10%', 0.10, 'RETISR10', 'Retención de Impuesto Sobre la Renta 10%', 'retencion de impuesto sobre la renta 10%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'Retención ISR 20%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('Retención ISR 20%', 'retencion isr 20%', 0.20, 'RETISR20', 'Retención de Impuesto Sobre la Renta 20%', 'retencion de impuesto sobre la renta 20%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'Retención IVA 10.67%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('Retención IVA 10.67%', 'retencion iva 10.67%', 0.1067, 'RETIVA10', 'Retención de IVA al 10.67% (servicios subcontratados)', 'retencion de iva al 10.67%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = 'Retención IVA 6%')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('Retención IVA 6%', 'retencion iva 6%', 0.06, 'RETIVA6', 'Retención de IVA al 6% (comisiones)', 'retencion de iva al 6%', 1, GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM catalogos.tipos_impuesto WHERE nombre = '2% Servicio')
    INSERT INTO catalogos.tipos_impuesto (nombre, nombre_normalizado, tasa, clave, descripcion, descripcion_normalizada, activo, fecha_creacion)
    VALUES ('2% Servicio', '2% servicio', 0.02, 'SERV02', 'Servicio de 2% sobre importe', 'servicio de 2% sobre importe', 1, GETUTCDATE());
