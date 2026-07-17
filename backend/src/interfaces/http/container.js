'use strict';

require('dotenv').config();

const EventBus                  = require('../../application/EventBus');
const TallerFacade              = require('../../application/TallerFacade');
const JwtAdapter                = require('../../infrastructure/auth/JwtAdapter');
const PrismaOrdenRepository     = require('../../infrastructure/persistence/prisma/PrismaOrdenRepository');
const PrismaClienteRepository   = require('../../infrastructure/persistence/prisma/PrismaClienteRepository');
const PrismaVehiculoRepository  = require('../../infrastructure/persistence/prisma/PrismaVehiculoRepository');
const PrismaUsuarioRepository   = require('../../infrastructure/persistence/prisma/PrismaUsuarioRepository');
const PrismaFacturaRepository   = require('../../infrastructure/persistence/prisma/PrismaFacturaRepository');
const PrismaMecanicoRepository  = require('../../infrastructure/persistence/prisma/PrismaMecanicoRepository');
const NotificadorEmail          = require('../../infrastructure/notifications/NotificadorEmail');
const BitacoraAuditoria         = require('../../infrastructure/notifications/BitacoraAuditoria');
const crearAuthMiddleware        = require('../../infrastructure/auth/authMiddleware');

/**
 * container.js — Contenedor de Inyección de Dependencias (DI Manual)
 *
 * Wiring de todas las dependencias:
 *   Repositorios → Facade → Controladores
 *
 * SOLID: DIP — las capas superiores reciben sus dependencias, no las crean.
 * Nota académica: para producción usar InversifyJS o similar.
 */

// ── 1. Repositorios ───────────────────────────────────────────
const ordenRepo    = new PrismaOrdenRepository();
const clienteRepo  = new PrismaClienteRepository();
const vehiculoRepo = new PrismaVehiculoRepository();
const usuarioRepo  = new PrismaUsuarioRepository();
const facturaRepo  = new PrismaFacturaRepository();
const mecanicoRepo = new PrismaMecanicoRepository();
const configRepo   = require('../../infrastructure/persistence/prisma/PrismaConfiguracionRepository');

// ── 2. Auth ───────────────────────────────────────────────────
const jwtAdapter = new JwtAdapter(
  process.env.JWT_SECRET    || 'dev_secret_cambiar_en_produccion',
  process.env.JWT_EXPIRES_IN || '8h'
);
const authMiddleware = crearAuthMiddleware(jwtAdapter);

// ── 3. EventBus + Suscripciones (Observer) ───────────────────
const eventBus = new EventBus();
eventBus.suscribir('OrdenCreada',    new BitacoraAuditoria());
eventBus.suscribir('OrdenCreada',    new NotificadorEmail());
eventBus.suscribir('EstadoCambiado', new BitacoraAuditoria());
eventBus.suscribir('EstadoCambiado', new NotificadorEmail());

// ── 4. Facade (único punto de acceso desde controllers) ──────
const tallerFacade = new TallerFacade({
  ordenRepo,
  clienteRepo,
  vehiculoRepo,
  facturaRepo,
  usuarioRepo,
  mecanicoRepo,
  configRepo,
  eventBus,
  jwtAdapter,
});

module.exports = {
  tallerFacade,
  authMiddleware,
  jwtAdapter,
};
