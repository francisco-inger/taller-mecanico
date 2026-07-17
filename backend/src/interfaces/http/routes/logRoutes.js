'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../container');
const requerirRoles    = require('../middleware/roleMiddleware');
const logRepo          = require('../../../infrastructure/persistence/prisma/PrismaLogRepository');

const router = Router();

// Solo ADMIN puede consultar el log de auditoría
router.use(authMiddleware);
router.use(requerirRoles('ADMIN'));

/**
 * GET /api/log-actividad
 *
 * Query params opcionales:
 *   - entidad    : 'ORDEN' | 'CLIENTE' | 'USUARIO' | 'FACTURA'
 *   - entidadId  : UUID de la entidad específica
 *   - usuarioId  : UUID del usuario que realizó la acción
 *   - limite     : número máximo de resultados (default 100, max 500)
 */
router.get('/', async (req, res, next) => {
  try {
    const { entidad, entidadId, usuarioId } = req.query;
    const limite = Math.min(parseInt(req.query.limite) || 100, 500);

    const logs = await logRepo.listar({ entidad, entidadId, usuarioId, limite });
    res.json({ success: true, data: logs, message: 'OK' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
