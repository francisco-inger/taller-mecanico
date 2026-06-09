'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/UsuarioController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

// Todas las rutas de gestión de usuarios requieren ser ADMIN
router.use(authMiddleware);
router.use(requerirRoles('ADMIN'));

router.post('/',    ctrl.crear);
router.get('/',     ctrl.listar);
router.patch('/:id', ctrl.actualizar);

module.exports = router;
