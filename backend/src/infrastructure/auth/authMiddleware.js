'use strict';

/**
 * authMiddleware — Middleware de autenticación JWT
 *
 * Verifica el Bearer token en el header Authorization.
 * Si es válido, adjunta el usuario decodificado al request.
 *
 * SOLID: SRP — única responsabilidad: verificar autenticación
 */

/**
 * Fábrica del middleware. Recibe el JwtAdapter para evitar importación directa.
 * @param {import('./JwtAdapter')} jwtAdapter
 * @returns {Function} Middleware Express
 */
const crearAuthMiddleware = (jwtAdapter) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data:    null,
        message: 'Acceso denegado. Token no proporcionado.',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const usuario = jwtAdapter.verificar(token);
      req.usuario   = usuario;
      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        data:    null,
        message: err.message,
      });
    }
  };
};

module.exports = crearAuthMiddleware;
