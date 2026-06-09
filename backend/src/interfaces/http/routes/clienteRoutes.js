'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/ClienteController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/',               requerirRoles('ADMIN', 'RECEPCIONISTA'), ctrl.crear);
router.patch('/:id',            requerirRoles('ADMIN'), ctrl.actualizar);
router.get('/',                ctrl.listar);
router.get('/:id',             ctrl.obtener);
router.get('/:id/historial',   ctrl.historial);

module.exports = router;
