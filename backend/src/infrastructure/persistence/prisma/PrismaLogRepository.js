'use strict';

const prisma = require('./prismaClient');

/**
 * PrismaLogRepository — Repositorio de auditoría
 *
 * Persiste y consulta entradas del log de actividad del sistema.
 * Principio ético: transparencia y trazabilidad (SIGEST).
 *
 * SOLID: SRP — única responsabilidad: gestionar log_actividad.
 */
class PrismaLogRepository {
  /**
   * Registra una acción de auditoría.
   * Esta operación NO lanza excepción para no interrumpir el flujo principal.
   *
   * @param {object} datos
   * @param {string} datos.usuarioId
   * @param {string} datos.usuarioNombre
   * @param {string} datos.usuarioRol
   * @param {string} datos.accion         - Valor del enum AccionLog
   * @param {string} datos.entidad        - 'ORDEN' | 'CLIENTE' | 'USUARIO' | 'FACTURA'
   * @param {string} datos.entidadId
   * @param {string} [datos.detalle]
   */
  async registrar({ usuarioId, usuarioNombre, usuarioRol, accion, entidad, entidadId, detalle }) {
    try {
      await prisma.logActividad.create({
        data: {
          usuarioId,
          usuarioNombre,
          usuarioRol,
          accion,
          entidad,
          entidadId,
          detalle: detalle || null,
        },
      });
    } catch (err) {
      // El fallo del log nunca debe interrumpir la operación principal
      console.error('[LogRepository] Error al registrar auditoría:', err.message);
    }
  }

  /**
   * Lista entradas del log con filtros opcionales.
   *
   * @param {object}  [filtros]
   * @param {string}  [filtros.entidad]    - Filtrar por tipo de entidad
   * @param {string}  [filtros.entidadId]  - Filtrar por ID de entidad específica
   * @param {string}  [filtros.usuarioId]  - Filtrar por usuario que realizó la acción
   * @param {number}  [filtros.limite]     - Máximo de resultados (default 100)
   * @returns {Promise<Array>}
   */
  async listar({ entidad, entidadId, usuarioId, limite = 100 } = {}) {
    const where = {};
    if (entidad)   where.entidad   = entidad;
    if (entidadId) where.entidadId = entidadId;
    if (usuarioId) where.usuarioId = usuarioId;

    return prisma.logActividad.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      take: limite,
    });
  }
}

module.exports = new PrismaLogRepository();
