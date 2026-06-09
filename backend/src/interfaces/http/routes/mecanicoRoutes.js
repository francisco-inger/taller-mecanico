'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/MecanicoController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

// Cualquiera puede listar mecanicos para asignar a ordenes
router.get('/',               ctrl.listar);
router.get('/estadisticas',   ctrl.estadisticas);

// Solo Admin puede crear/editar mecanicos
router.post('/',              requerirRoles('ADMIN'), ctrl.crear);
router.patch('/:id',           requerirRoles('ADMIN'), ctrl.actualizar);

module.exports = router;
