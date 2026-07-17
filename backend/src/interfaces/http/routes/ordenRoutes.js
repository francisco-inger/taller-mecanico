'use strict';

const { Router } = require('express');
const ctrl          = require('../controllers/OrdenController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');
const audit         = require('../middleware/auditMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas específicas primero (con subrutas)
router.patch('/:id/estado',    requerirRoles('ADMIN', 'MECANICO'),                audit({ accion: 'AVANZAR_ESTADO', entidad: 'ORDEN' }), ctrl.avanzarEstado);
router.patch('/:id/avanzar',   requerirRoles('ADMIN', 'RECEPCIONISTA', 'MECANICO'), audit({ accion: 'AVANZAR_ESTADO', entidad: 'ORDEN' }), ctrl.avanzarEstado);
router.get('/:id/presupuesto', ctrl.presupuesto);
router.post('/:id/aprobar',    requerirRoles('ADMIN', 'CAJERO'),                  audit({ accion: 'APROBAR', entidad: 'ORDEN' }),         ctrl.aprobar);
router.post('/:id/rechazar',   requerirRoles('ADMIN', 'CAJERO'),                  audit({ accion: 'RECHAZAR', entidad: 'ORDEN' }),        ctrl.rechazar);
router.delete('/:id',          requerirRoles('ADMIN'),                            audit({ accion: 'ELIMINAR', entidad: 'ORDEN' }),        ctrl.eliminar);

// Rutas genéricas después
router.post('/',  requerirRoles('ADMIN', 'RECEPCIONISTA'), audit({ accion: 'CREAR', entidad: 'ORDEN' }), ctrl.crear);
router.get('/',   ctrl.listar);
router.get('/:id', ctrl.obtener);

module.exports = router;

