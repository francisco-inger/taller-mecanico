'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/FacturaController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.get('/',            ctrl.listar);
router.post('/',           requerirRoles('ADMIN', 'CAJERO'), ctrl.crear);
router.get('/:id',         ctrl.obtener);
router.patch('/:id',       requerirRoles('ADMIN'), ctrl.actualizar);
router.delete('/:id',      requerirRoles('ADMIN'), ctrl.eliminar);

module.exports = router;
