'use strict';

require('dotenv').config();

const app    = require('./app');
const prisma = require('../../infrastructure/persistence/prisma/prismaClient');

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    // Verificar conexión con la BD
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║   🔧 Taller Mecánico — Sistema de Órdenes de Servicio  ║
╠═══════════════════════════════════════════════════════╣
║   Servidor corriendo en: http://localhost:${PORT}         ║
║   Health check:          http://localhost:${PORT}/api/health ║
║   Autor: Francisco R. Diaz                             ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// ── Manejo de señales de cierre ─────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

iniciar();
