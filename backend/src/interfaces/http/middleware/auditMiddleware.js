'use strict';

const logRepo = require('../../infrastructure/persistence/prisma/PrismaLogRepository');

/**
 * auditMiddleware — Middleware de Auditoría (Trazabilidad)
 *
 * Registra automáticamente en log_actividad quién ejecutó una acción,
 * sobre qué entidad y cuándo. Se usa DESPUÉS de authMiddleware.
 *
 * El registro ocurre de forma asíncrona sin bloquear la respuesta HTTP.
 *
 * Principio ético SIGEST: transparencia y trazabilidad.
 *
 * @param {object}   config
 * @param {string}   config.accion       - AccionLog enum: 'CREAR', 'ACTUALIZAR', etc.
 * @param {string}   config.entidad      - 'ORDEN' | 'CLIENTE' | 'USUARIO' | 'FACTURA'
 * @param {Function} [config.getEntidadId] - (req, res_data) => string; extrae el ID de la entidad
 *                                          Por defecto usa req.params.id o el id de la respuesta
 * @returns {Function} Middleware Express
 *
 * @example
 * router.post('/', authMiddleware, requerirRoles('ADMIN'), audit({ accion: 'CREAR', entidad: 'USUARIO' }), ctrl.crear);
 */
const audit = ({ accion, entidad, getEntidadId } = {}) => {
  return (req, res, next) => {
    // Interceptamos res.json para capturar la respuesta exitosa
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      // Registrar solo si la operación fue exitosa (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300 && req.usuario) {
        const usuario = req.usuario;

        // Intentar extraer el ID de la entidad afectada
        let entidadId = 'N/A';
        try {
          if (getEntidadId) {
            entidadId = getEntidadId(req, body?.data) || 'N/A';
          } else if (req.params?.id) {
            entidadId = req.params.id;
          } else if (body?.data?.id) {
            entidadId = body.data.id;
          } else if (body?.data?.factura?.id) {
            entidadId = body.data.factura.id;
          }
        } catch (_) { /* silencioso */ }

        // Registro asíncrono — no bloquea la respuesta
        setImmediate(() => {
          logRepo.registrar({
            usuarioId:     usuario.id,
            usuarioNombre: usuario.nombre,
            usuarioRol:    usuario.rol,
            accion,
            entidad,
            entidadId,
            detalle: body?.message || null,
          });
        });
      }

      return originalJson(body);
    };

    next();
  };
};

module.exports = audit;
