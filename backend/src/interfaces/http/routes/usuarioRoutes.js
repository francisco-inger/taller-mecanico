'use strict';

const { Router } = require('express');
const ctrl          = require('../controllers/UsuarioController');
const { authMiddleware } = require('../container');
const requerirRoles = require('../middleware/roleMiddleware');
const audit         = require('../middleware/auditMiddleware');

const router = Router();

// Todas las rutas de gestión de usuarios requieren ser ADMIN
router.use(authMiddleware);
router.use(requerirRoles('ADMIN'));

router.post('/',     audit({ accion: 'CREAR',      entidad: 'USUARIO' }), ctrl.crear);
router.get('/',      ctrl.listar);
router.patch('/:id', audit({ accion: 'ACTUALIZAR', entidad: 'USUARIO' }), ctrl.actualizar);

module.exports = router;

