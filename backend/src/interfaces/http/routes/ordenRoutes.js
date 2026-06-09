'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/OrdenController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas específicas primero (con subrutas)
router.patch('/:id/estado',         requerirRoles('ADMIN', 'MECANICO'),       ctrl.avanzarEstado);
router.patch('/:id/avanzar',        requerirRoles('ADMIN', 'RECEPCIONISTA', 'MECANICO'), ctrl.avanzarEstado);
router.get('/:id/presupuesto',      ctrl.presupuesto);
router.post('/:id/aprobar',         requerirRoles('ADMIN', 'CAJERO'),         ctrl.aprobar);
router.post('/:id/rechazar',        requerirRoles('ADMIN', 'CAJERO'),         ctrl.rechazar);
router.delete('/:id',               requerirRoles('ADMIN'),                    ctrl.eliminar);

// Rutas genéricas después
router.post('/',                    requerirRoles('ADMIN', 'RECEPCIONISTA'),  ctrl.crear);
router.get('/',                     ctrl.listar);
router.get('/:id',                  ctrl.obtener);

module.exports = router;
