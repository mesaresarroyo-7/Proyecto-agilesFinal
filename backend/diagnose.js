// Script de diagnóstico temporal
require('dotenv').config();
const { Pool } = require('pg');

async function diagnose() {
  console.log('=== DIAGNÓSTICO DE CONEXIÓN ===\n');
  console.log('Variables de entorno:');
  console.log('  DB_HOST:', process.env.DB_HOST || '(no definido)');
  console.log('  DB_PORT:', process.env.DB_PORT || '(no definido)');
  console.log('  DB_NAME:', process.env.DB_NAME || '(no definido)');
  console.log('  DB_USER:', process.env.DB_USER || '(no definido)');
  console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '****(definido)' : '(no definido)');
  console.log('');

  // Test 1: Conexión básica a PostgreSQL (sin BD específica)
  console.log('--- Test 1: Conexión a PostgreSQL ---');
  const pool1 = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres',
    connectionTimeoutMillis: 5000
  });

  try {
    const res = await pool1.query('SELECT version()');
    console.log('  ✅ Conexión a PostgreSQL exitosa');
    console.log('  Versión:', res.rows[0].version.substring(0, 50));
  } catch (err) {
    console.log('  ❌ Error conectando a PostgreSQL:', err.message);
    console.log('  Posible causa: contraseña incorrecta o PostgreSQL no accesible');
    await pool1.end();
    process.exit(1);
  }

  // Test 2: Verificar si existe la BD dollarcity_santa_anita
  console.log('\n--- Test 2: Verificar BD dollarcity_santa_anita ---');
  try {
    const res = await pool1.query("SELECT datname FROM pg_database WHERE datname = 'dollarcity_santa_anita'");
    if (res.rows.length > 0) {
      console.log('  ✅ Base de datos dollarcity_santa_anita EXISTE');
    } else {
      console.log('  ❌ Base de datos dollarcity_santa_anita NO EXISTE');
      console.log('  Debe crearla ejecutando: CREATE DATABASE dollarcity_santa_anita;');
      await pool1.end();
      process.exit(1);
    }
  } catch (err) {
    console.log('  ❌ Error:', err.message);
  }
  await pool1.end();

  // Test 3: Conexión a la BD específica y verificar tablas
  console.log('\n--- Test 3: Verificar tablas y datos ---');
  const pool2 = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'dollarcity_santa_anita',
    connectionTimeoutMillis: 5000
  });

  try {
    // Verificar tabla usuarios
    const tablas = await pool2.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
    console.log('  Tablas encontradas:', tablas.rows.map(r => r.tablename).join(', '));

    if (tablas.rows.length === 0) {
      console.log('  ❌ No hay tablas. Ejecute schema.sql primero.');
      await pool2.end();
      process.exit(1);
    }

    // Verificar usuarios
    const usuarios = await pool2.query('SELECT id, email, rol, LEFT(password_hash, 20) as hash_preview FROM usuarios');
    console.log('\n  Usuarios encontrados:', usuarios.rows.length);
    usuarios.rows.forEach(u => {
      console.log(`    - ${u.email} (${u.rol}) hash: ${u.hash_preview}...`);
    });

    if (usuarios.rows.length === 0) {
      console.log('  ❌ No hay usuarios. Ejecute seed.sql.');
    }

    // Test de bcrypt
    if (usuarios.rows.length > 0) {
      console.log('\n--- Test 4: Verificar bcrypt ---');
      const bcrypt = require('bcrypt');
      const adminRow = await pool2.query("SELECT password_hash FROM usuarios WHERE email = 'admin@dollarcity.pe'");
      if (adminRow.rows.length > 0) {
        const match = await bcrypt.compare('Admin123!', adminRow.rows[0].password_hash);
        console.log('  Verificación admin@dollarcity.pe / Admin123!:', match ? '✅ CORRECTO' : '❌ NO COINCIDE');
      }
    }

    // Verificar productos
    const productos = await pool2.query('SELECT COUNT(*) as total FROM productos');
    console.log('\n  Productos:', productos.rows[0].total);

  } catch (err) {
    console.log('  ❌ Error:', err.message);
  }

  await pool2.end();
  console.log('\n=== FIN DIAGNÓSTICO ===');
}

diagnose().catch(err => {
  console.error('Error fatal:', err.message);
  process.exit(1);
});
