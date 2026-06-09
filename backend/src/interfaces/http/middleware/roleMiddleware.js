'use strict';

/**
 * roleMiddleware — Middleware de Autorización por Rol
 *
 * Verifica que el usuario autenticado tenga alguno de los roles requeridos.
 * Debe usarse DESPUÉS de authMiddleware.
 *
 * @param {...string} rolesPermitidos - Ej: 'ADMIN', 'CAJERO'
 * @returns {Function} Middleware Express
 *
 * @example
 * router.post('/facturas', authMiddleware, requerirRoles('ADMIN', 'CAJERO'), controller.generar);
 */
const requerirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({
        success: false,
        data:    null,
        message: 'No autenticado',
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        data:    null,
        message: `Acceso denegado. Roles permitidos: ${rolesPermitidos.join(', ')}`,
      });
    }

    next();
  };
};

module.exports = requerirRoles;
