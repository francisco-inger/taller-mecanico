'use strict';

const { Router } = require('express');
const ctrl          = require('../controllers/ClienteController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');
const audit         = require('../middleware/auditMiddleware');

const router = Router();

router.use(authMiddleware);

// Crear cliente — solo Admin/Recepcionista + auditoría
router.post('/',  requerirRoles('ADMIN', 'RECEPCIONISTA'), audit({ accion: 'CREAR', entidad: 'CLIENTE' }), ctrl.crear);

// Editar cliente — solo Admin + auditoría
router.patch('/:id', requerirRoles('ADMIN'), audit({ accion: 'ACTUALIZAR', entidad: 'CLIENTE' }), ctrl.actualizar);

// Mecánicos NO pueden listar todos los clientes (privacidad: ven solo lo necesario para sus órdenes)
router.get('/',       requerirRoles('ADMIN', 'RECEPCIONISTA', 'CAJERO'), ctrl.listar);
router.get('/:id',              ctrl.obtener);
router.get('/:id/historial',    ctrl.historial);

module.exports = router;

