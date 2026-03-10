
-- CATÁLOGOS
DROP TABLE catalogos.empresas
DROP TABLE catalogos.sucursales
DROP TABLE catalogos.areas
DROP TABLE catalogos.tipos_gasto
DROP TABLE catalogos.unidades_medida

SELECT * FROM catalogos.tipos_gasto
SELECT * FROM catalogos.empresas
SELECT * FROM catalogos.sucursales
SELECT * FROM catalogos.areas


-- Tabla: empresas
CREATE TABLE catalogos.empresas (
    id_empresa INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    nombre_normalizado VARCHAR(255),
    descripcion VARCHAR(500),
    descripcion_normalizada VARCHAR(500),
    clave VARCHAR(50) UNIQUE,
    razon_social VARCHAR(255),
    rfc VARCHAR(13) UNIQUE,
    direccion VARCHAR(255),
    colonia VARCHAR(100),
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    codigo_postal VARCHAR(10),
    telefono VARCHAR(20),
    email VARCHAR(100),
    pagina_web VARCHAR(255),
    numero_empleados INT DEFAULT 0,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE() NOT NULL,
    fecha_modificacion DATETIME DEFAULT GETDATE()
);

--Tabla: sucursales
CREATE TABLE catalogos.sucursales (
    id_sucursal INT IDENTITY(1,1) PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    nombre_normalizado VARCHAR(255),
    descripcion VARCHAR(500),
    descripcion_normalizada VARCHAR(500),
    clave VARCHAR(50) UNIQUE,
	clave_contable VARCHAR(255) UNIQUE,
    direccion VARCHAR(255),
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100),
    estado VARCHAR(100),
    telefono VARCHAR(20),
    latitud DECIMAL(10, 7),
    longitud DECIMAL(10, 7),
    numero_empleados INT DEFAULT 0,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE() NOT NULL,
    fecha_modificacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_empresa) REFERENCES catalogos.empresas(id_empresa)
);

--Tabla: areas
CREATE TABLE catalogos.areas (
    id_area INT IDENTITY(1,1) PRIMARY KEY,
    id_empresa INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    nombre_normalizado VARCHAR(255),
    descripcion VARCHAR(500),
    descripcion_normalizada VARCHAR(500),
    clave VARCHAR(50) UNIQUE,
    id_supervisor_responsable int,
    numero_empleados INT DEFAULT 0,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE() NOT NULL,
    fecha_modificacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_empresa) REFERENCES catalogos.empresas(id_empresa)
);

--Tabla: tipos_gasto
CREATE TABLE catalogos.tipos_gasto (
    id_tipo_gasto INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    nombre_normalizado VARCHAR(255),
    descripcion VARCHAR(500),
    descripcion_normalizada VARCHAR(500),
    clave VARCHAR(50) UNIQUE,
    concepto VARCHAR(255),
    cuenta CHAR(3),
	sub_cuenta CHAR(3),
	analitica CHAR(3),
	integracion CHAR(3),
	cuenta_catalogo CHAR(15),
    requiere_comprobacion_pago BIT DEFAULT 1,
    requiere_comprobacion_gasto BIT DEFAULT 1,
    permite_sin_datos_fiscales BIT DEFAULT 0,
    dias_limite_comprobacion INT,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE() NOT NULL,
    fecha_modificacion DATETIME DEFAULT GETDATE()
);

--Tabla: tipos_medida
CREATE TABLE catalogos.tipos_medida (
    id_tipo_medida INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(80) UNIQUE NOT NULL,
    nombre_normalizado VARCHAR(80),
    descripcion VARCHAR(255),
    descripcion_normalizada VARCHAR(255),
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE() NOT NULL,
    fecha_modificacion DATETIME DEFAULT GETDATE()
);

-- Tabla: unidades_medida
CREATE TABLE catalogos.unidades_medida (
    id_unidad_medida INT IDENTITY(1,1) PRIMARY KEY,
    id_tipo_medida INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    nombre_normalizado VARCHAR(255),
    descripcion VARCHAR(500),
    descripcion_normalizada VARCHAR(500),
    abreviatura VARCHAR(20) UNIQUE NOT NULL,
    activo BIT DEFAULT 1,
    fecha_creacion DATETIME DEFAULT GETDATE() NOT NULL,
    fecha_modificacion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_tipo_medida) REFERENCES catalogos.tipos_medida(id_tipo_medida)
);
---------------
