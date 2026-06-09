'use strict';

const { PrismaClient } = require('@prisma/client');

/**
 * Instancia singleton del cliente Prisma.
 * Uso correcto de conexión de BD en Node.js: una sola instancia por proceso.
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'warn', 'error']
    : ['error'],
});

module.exports = prisma;
