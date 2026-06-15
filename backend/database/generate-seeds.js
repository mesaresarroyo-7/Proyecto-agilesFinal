/**
 * Script para generar el archivo seed.sql con contraseñas hasheadas con bcrypt.
 * Ejecutar: node database/generate-seeds.js
 */
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const SALT_ROUNDS = 10;

const usuarios = [
  { nombre: 'Administrador General', email: 'admin@dollarcity.pe', password: 'Admin123!', rol: 'admin' },
  { nombre: 'Carlos Vendedor', email: 'vendedor@dollarcity.pe', password: 'Vendedor123!', rol: 'vendedor' },
  { nombre: 'María Almacenera', email: 'almacen@dollarcity.pe', password: 'Almacen123!', rol: 'almacenero' }
];

async function generateSeeds() {
  console.log('Generando hashes bcrypt para usuarios...\n');

  const userInserts = [];

  for (const user of usuarios) {
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    console.log(`  ${user.email} (${user.password}) -> ${hash}`);
    userInserts.push(
      `('${user.nombre}', '${user.email}', '${hash}', '${user.rol}')`
    );
  }

  const seedSQL = `-- ============================================================
-- SEED DATA: DollarCity - Sede Santa Anita
-- Generado automáticamente con bcrypt (${SALT_ROUNDS} rounds)
-- ============================================================
-- Credenciales de prueba:
-- admin@dollarcity.pe     / Admin123!
-- vendedor@dollarcity.pe  / Vendedor123!
-- almacen@dollarcity.pe   / Almacen123!
-- ============================================================

-- USUARIOS
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
${userInserts.join(',\n')};

-- PROVEEDORES
INSERT INTO proveedores (ruc, razon_social, telefono, email, direccion) VALUES
('20100047218', 'Distribuidora Lima SAC', '01-4567890', 'ventas@distribuidoralima.pe', 'Av. Argentina 1234, Lima'),
('20456789012', 'Importaciones del Sur EIRL', '01-3456789', 'contacto@importsur.pe', 'Jr. Huancavelica 567, Lima'),
('20567890123', 'Proveedora Nacional SAC', '01-2345678', 'info@provnacional.pe', 'Av. Colonial 890, Callao'),
('20678901234', 'Global Trading Peru SA', '01-1234567', 'compras@globaltrading.pe', 'Av. Javier Prado Este 2000, San Isidro');

-- PRODUCTOS
INSERT INTO productos (codigo_barras, nombre, descripcion, categoria, precio, stock, stock_minimo, estado) VALUES
('7750001000010', 'Jabón Líquido Antibacterial 500ml', 'Jabón líquido antibacterial para manos, aroma lavanda', 'Higiene Personal', 12.90, 150, 20, 'ACTIVO'),
('7750001000027', 'Detergente en Polvo 2kg', 'Detergente multiusos para ropa, aroma floral', 'Limpieza', 18.50, 80, 15, 'ACTIVO'),
('7750001000034', 'Toallas Húmedas x80', 'Toallas húmedas antibacteriales para bebé', 'Bebé', 9.90, 200, 30, 'ACTIVO'),
('7750001000041', 'Shampoo Fortificante 400ml', 'Shampoo con keratina para cabello dañado', 'Higiene Personal', 15.90, 120, 20, 'ACTIVO'),
('7750001000058', 'Desinfectante Multiusos 1L', 'Desinfectante líquido aroma pino', 'Limpieza', 8.50, 90, 15, 'ACTIVO'),
('7750001000065', 'Papel Higiénico x12 rollos', 'Papel higiénico doble hoja extra suave', 'Hogar', 22.90, 60, 10, 'ACTIVO'),
('7750001000072', 'Cepillo Dental Suave x3', 'Pack de 3 cepillos dentales de cerdas suaves', 'Higiene Personal', 7.90, 180, 25, 'ACTIVO'),
('7750001000089', 'Organizador Plástico Grande', 'Caja organizadora transparente 30L', 'Hogar', 29.90, 45, 8, 'ACTIVO'),
('7750001000096', 'Vela Aromática Vainilla', 'Vela decorativa aroma vainilla 200g', 'Decoración', 14.50, 70, 10, 'ACTIVO'),
('7750001000102', 'Set de Platos Melamina x6', 'Juego de 6 platos de melamina diseño floral', 'Cocina', 35.90, 40, 8, 'ACTIVO'),
('7750001000119', 'Bolsa Reutilizable Ecológica', 'Bolsa de tela ecológica estampada', 'Accesorios', 5.90, 300, 50, 'ACTIVO'),
('7750001000126', 'Marco de Foto 20x30', 'Marco de foto decorativo color madera', 'Decoración', 19.90, 55, 10, 'ACTIVO'),
('7750001000133', 'Jabón de Tocador x3', 'Pack de 3 jabones de tocador aroma rosas', 'Higiene Personal', 6.50, 160, 25, 'ACTIVO'),
('7750001000140', 'Esponja de Cocina x6', 'Pack de 6 esponjas multiuso para cocina', 'Limpieza', 4.90, 200, 30, 'ACTIVO'),
('7750001000157', 'Ambientador Spray 360ml', 'Ambientador en spray aroma primavera', 'Hogar', 11.90, 110, 15, 'ACTIVO');
`;

  const outputPath = path.join(__dirname, 'seed.sql');
  fs.writeFileSync(outputPath, seedSQL, 'utf8');
  console.log(`\n✅ Archivo seed.sql generado en: ${outputPath}`);
}

generateSeeds().catch(console.error);
