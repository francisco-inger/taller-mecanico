'use strict';

const { Router } = require('express');
const { authMiddleware, firmaDigitalRepo } = require('../container');
const logRepo = require('../../../infrastructure/persistence/prisma/PrismaLogRepository');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(authMiddleware);

/**
 * GET /api/firmas
 * Listar todas las firmas del sistema (Solo Admin)
 */
router.get('/', requerirRoles('ADMIN'), async (req, res, next) => {
  try {
    const firmas = await firmaDigitalRepo.listar();
    res.json({ success: true, data: firmas });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/firmas/:entidad/:entidadId
 * Obtener las firmas asociadas a una entidad y un ID específico (ej. ORDEN y idDeLaOrden)
 */
router.get('/:entidad/:entidadId', async (req, res, next) => {
  try {
    const { entidad, entidadId } = req.params;
    const firmas = await firmaDigitalRepo.obtainPorEntidad(entidad, entidadId);
    
    // Si la función en el repo se llama obtenerPorEntidad (tenemos que verificar: en PrismaFirmaDigitalRepository pusimos obtenerPorEntidad)
    // Espera, en PrismaFirmaDigitalRepository pusimos `obtenerPorEntidad`. Corrijamos la llamada a `obtenerPorEntidad`.
    const data = await firmaDigitalRepo.obtenerPorEntidad(entidad, entidadId);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/firmas
 * Guardar una nueva firma ( canvas base64 )
 */
router.post('/', async (req, res, next) => {
  try {
    const { entidad, entidadId, firmante, imagenBase64 } = req.body;

    if (!entidad || !entidadId || !firmante || !imagenBase64) {
      return res.status(400).json({ success: false, message: 'entidad, entidadId, firmante e imagenBase64 son requeridos' });
    }

    const resultado = await firmaDigitalRepo.guardar({
      entidad,
      entidadId,
      firmante,
      imagenBase64,
      usuarioId: req.user.id
    });

    // Registrar en log de auditoría de SIGEST
    await logRepo.crear({
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'APROBAR',
      entidad: entidad === 'ORDEN' ? 'ORDEN' : entidad === 'FACTURA' ? 'FACTURA' : 'CLIENTE',
      entidadId: entidadId,
      detalle: `Firma digital registrada por ${firmante} para la entidad ${entidad} (${entidadId}). Firmado bajo la Ley 126-02 RD.`
    });

    res.status(201).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
