'use strict';

const { Router } = require('express');
const ctrl = require('../controllers/AuthController');
const { authMiddleware } = require('../container');

const router = Router();

/** POST /api/auth/login */
router.post('/login', ctrl.login);

/** GET /api/auth/me — Requiere token */
router.get('/me', authMiddleware, ctrl.me);

module.exports = router;
