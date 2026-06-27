'use strict';

/**
 * errorHandler — Middleware global de manejo de errores
 *
 * Captura todos los errores no manejados y retorna respuesta JSON estándar.
 * SOLID: SRP — única responsabilidad: normalizar respuestas de error
 */
const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || err.code === 'P2025' ? 404 : 500;
  const message    = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    success: false,
    data:    null,
    message,
  });
};

module.exports = errorHandler;
