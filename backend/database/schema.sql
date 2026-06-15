-- ============================================================
-- SCHEMA: Sistema de Gestión DollarCity - Sede Santa Anita
-- Base de datos: dollarcity_santa_anita
-- ============================================================

-- Eliminar tablas en orden correcto (dependencias)
DROP TABLE IF EXISTS comprobantes CASCADE;
DROP TABLE IF EXISTS kardex CASCADE;
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS detalle_compras CASCADE;
DROP TABLE IF EXISTS compras CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'vendedor', 'almacenero')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================================
-- TABLA: productos
-- ============================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100),
    precio NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INTEGER NOT NULL DEFAULT 5,
    estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO')),
    imagen_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_productos_codigo ON productos(codigo_barras);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_categoria ON productos(categoria);

-- ============================================================
-- TABLA: proveedores
-- ============================================================
CREATE TABLE proveedores (
    id SERIAL PRIMARY KEY,
    ruc VARCHAR(20) UNIQUE NOT NULL,
    razon_social VARCHAR(200) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proveedores_ruc ON proveedores(ruc);

-- ============================================================
-- TABLA: compras
-- ============================================================
CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    proveedor_id INTEGER NOT NULL REFERENCES proveedores(id),
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    subtotal NUMERIC(12,2) NOT NULL,
    igv NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA' CHECK (estado IN ('COMPLETADA', 'ANULADA'))
);

CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_usuario ON compras(usuario_id);
CREATE INDEX idx_compras_fecha ON compras(fecha_compra);

-- ============================================================
-- TABLA: detalle_compras
-- ============================================================
CREATE TABLE detalle_compras (
    id SERIAL PRIMARY KEY,
    compra_id INTEGER NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_detalle_compras_compra ON detalle_compras(compra_id);
CREATE INDEX idx_detalle_compras_producto ON detalle_compras(producto_id);

-- ============================================================
-- TABLA: ventas
-- ============================================================
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo_comprobante VARCHAR(10) NOT NULL CHECK (tipo_comprobante IN ('BOLETA', 'FACTURA')),
    numero_comprobante VARCHAR(20) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    igv NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    payment_token VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    payment_reference VARCHAR(100),
    fecha_venta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) NOT NULL DEFAULT 'COMPLETADA' CHECK (estado IN ('COMPLETADA', 'ANULADA'))
);

CREATE INDEX idx_ventas_usuario ON ventas(usuario_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_comprobante ON ventas(numero_comprobante);
CREATE INDEX idx_ventas_estado ON ventas(estado);

-- ============================================================
-- TABLA: detalle_ventas
-- ============================================================
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_detalle_ventas_venta ON detalle_ventas(venta_id);
CREATE INDEX idx_detalle_ventas_producto ON detalle_ventas(producto_id);

-- ============================================================
-- TABLA: kardex
-- ============================================================
CREATE TABLE kardex (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    tipo_movimiento VARCHAR(10) NOT NULL CHECK (tipo_movimiento IN ('INGRESO', 'SALIDA')),
    origen VARCHAR(10) NOT NULL CHECK (origen IN ('COMPRA', 'VENTA')),
    referencia_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    descripcion TEXT,
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id)
);

CREATE INDEX idx_kardex_producto ON kardex(producto_id);
CREATE INDEX idx_kardex_tipo ON kardex(tipo_movimiento);
CREATE INDEX idx_kardex_fecha ON kardex(fecha_movimiento);
CREATE INDEX idx_kardex_origen ON kardex(origen);

-- ============================================================
-- TABLA: comprobantes
-- ============================================================
CREATE TABLE comprobantes (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    tipo_comprobante VARCHAR(10) NOT NULL CHECK (tipo_comprobante IN ('BOLETA', 'FACTURA')),
    numero_comprobante VARCHAR(20) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    igv NUMERIC(12,2) NOT NULL,
    total NUMERIC(12,2) NOT NULL,
    fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comprobantes_venta ON comprobantes(venta_id);
CREATE INDEX idx_comprobantes_numero ON comprobantes(numero_comprobante);
