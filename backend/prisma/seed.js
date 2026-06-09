'use strict';

/**
 * seed.js — Datos de prueba para desarrollo
 *
 * Ejecutar: npm run db:seed
 *
 * Crea:
 *  - 2 usuarios (admin + recepcionista)
 *  - 2 clientes
 *  - 2 vehículos
 *  - 1 mecánico
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // ── Usuarios ──────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin123!', 10);
  const recepPass = await bcrypt.hash('Recep123!', 10);

  await prisma.usuario.upsert({
    where:  { email: 'admin@taller.com' },
    update: {},
    create: {
      nombre:       'Francisco Díaz (Admin)',
      email:        'admin@taller.com',
      passwordHash: adminPass,
      rol:          'ADMIN',
    },
  });

  await prisma.usuario.upsert({
    where:  { email: 'recepcion@taller.com' },
    update: {},
    create: {
      nombre:       'María García (Recepción)',
      email:        'recepcion@taller.com',
      passwordHash: recepPass,
      rol:          'RECEPCIONISTA',
    },
  });

  // ── Mecánicos ─────────────────────────────────────────────────
  const mecanico = await prisma.mecanico.upsert({
    where:  { id: 'mec-00000001-0001-0001-0001-000000000001' },
    update: {},
    create: {
      id:          'mec-00000001-0001-0001-0001-000000000001',
      nombre:      'Carlos Rodríguez',
      telefono:    '809-555-1234',
      especialidad: 'Motor y transmisión',
    },
  });

  // ── Clientes ──────────────────────────────────────────────────
  const cliente1 = await prisma.cliente.upsert({
    where:  { cedula: '001-0000001-1' },
    update: {},
    create: {
      nombre:      'Juan Martínez',
      telefono:    '809-555-0001',
      email:       'juan.martinez@email.com',
      cedula:      '001-0000001-1',
      esFrecuente: true,
    },
  });

  const cliente2 = await prisma.cliente.upsert({
    where:  { cedula: '001-0000002-2' },
    update: {},
    create: {
      nombre:      'Ana Pérez',
      telefono:    '809-555-0002',
      email:       'ana.perez@email.com',
      cedula:      '001-0000002-2',
      esFrecuente: false,
    },
  });

  // ── Vehículos ─────────────────────────────────────────────────
  await prisma.vehiculo.upsert({
    where:  { placa: 'A123456' },
    update: {},
    create: {
      clienteId:   cliente1.id,
      marca:       'Toyota',
      modelo:      'Corolla',
      anio:        2019,
      placa:       'A123456',
      kilometraje: 45000,
      color:       'Blanco',
    },
  });

  await prisma.vehiculo.upsert({
    where:  { placa: 'B789012' },
    update: {},
    create: {
      clienteId:   cliente2.id,
      marca:       'Honda',
      modelo:      'Civic',
      anio:        2021,
      placa:       'B789012',
      kilometraje: 18000,
      color:       'Gris',
    },
  });

  console.log('✅ Seed completado exitosamente!');
  console.log('\n👤 Credenciales de acceso:');
  console.log('   Admin:       admin@taller.com / Admin123!');
  console.log('   Recepción:   recepcion@taller.com / Recep123!');
}

main()
  .catch((err) => {
    console.error('❌ Error en seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
