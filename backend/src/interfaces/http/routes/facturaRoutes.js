'use strict';

const { Router } = require('express');
const ctrl          = require('../controllers/FacturaController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');
const audit         = require('../middleware/auditMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/',     ctrl.listar);
router.post('/',    requerirRoles('ADMIN', 'CAJERO'), audit({ accion: 'GENERAR_FACTURA', entidad: 'FACTURA' }), ctrl.crear);
router.get('/:id',  ctrl.obtener);
router.patch('/:id', requerirRoles('ADMIN'), audit({ accion: 'ACTUALIZAR', entidad: 'FACTURA' }), ctrl.actualizar);
router.delete('/:id', requerirRoles('ADMIN'), audit({ accion: 'ELIMINAR', entidad: 'FACTURA' }), ctrl.eliminar);

module.exports = router;

