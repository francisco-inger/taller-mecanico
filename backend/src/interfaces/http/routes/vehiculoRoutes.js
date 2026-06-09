'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/VehiculoController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

router.use(authMiddleware);

router.post('/',                       requerirRoles('ADMIN', 'RECEPCIONISTA'), ctrl.crear);
router.get('/:id',                     ctrl.obtener);
router.get('/cliente/:clienteId',      ctrl.porCliente);

module.exports = router;
