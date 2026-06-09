'use strict';

const { tallerFacade, authMiddleware } = require('../container');

/**
 * AuthController — Controlador de autenticación
 */
class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, data: null, message: 'Email y contraseña son requeridos' });
      }
      const resultado = await tallerFacade.login(email, password);
      res.json({ success: true, data: resultado, message: 'Login exitoso' });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/auth/me — Retorna el usuario autenticado
   */
  me(req, res) {
    res.json({ success: true, data: req.usuario, message: 'Usuario autenticado' });
  }
}

module.exports = new AuthController();
