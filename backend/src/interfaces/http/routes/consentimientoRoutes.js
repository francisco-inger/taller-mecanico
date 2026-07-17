'use strict';

const { Router } = require('express');
const { authMiddleware, consentimientoRepo } = require('../container');
const logRepo = require('../../../infrastructure/persistence/prisma/PrismaLogRepository');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

// Todas las rutas de consentimiento requieren estar autenticado
router.use(authMiddleware);

/**
 * GET /api/consentimientos
 * Listar consentimientos (filtro opcional por clienteId)
 */
router.get('/', async (req, res, next) => {
  try {
    const { clienteId } = req.query;
    let datos;
    if (clienteId) {
      datos = await consentimientoRepo.listarPorCliente(clienteId);
    } else {
      datos = await consentimientoRepo.listarTodos();
    }
    res.json({ success: true, data: datos });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/consentimientos
 * Crear o actualizar consentimiento
 */
router.post('/', requerirRoles('ADMIN', 'RECEPCIONISTA'), async (req, res, next) => {
  try {
    const { clienteId, tipo, otorgado, observacion } = req.body;
    
    if (!clienteId || !tipo) {
      return res.status(400).json({ success: false, message: 'clienteId y tipo son requeridos' });
    }

    // Busquemos si ya tiene un consentimiento de ese tipo para actualizar o crear nuevo
    const existentes = await consentimientoRepo.listarPorCliente(clienteId);
    const existente = existentes.find(c => c.tipo === tipo);

    let resultado;
    if (existente) {
      resultado = await consentimientoRepo.actualizar(existente.id, { otorgado, observacion });
      
      // Registrar en log de auditoría
      await logRepo.crear({
        usuarioId: req.user.id,
        usuarioNombre: req.user.nombre,
        usuarioRol: req.user.rol,
        accion: 'ACTUALIZAR',
        entidad: 'CLIENTE',
        entidadId: clienteId,
        detalle: `Modificó consentimiento tipo ${tipo} a otorgado=${otorgado} para cliente ${clienteId}`
      });
    } else {
      resultado = await consentimientoRepo.crear({ clienteId, tipo, otorgado, observacion });
      
      // Registrar en log de auditoría
      await logRepo.crear({
        usuarioId: req.user.id,
        usuarioNombre: req.user.nombre,
        usuarioRol: req.user.rol,
        accion: 'CREAR',
        entidad: 'CLIENTE',
        entidadId: clienteId,
        detalle: `Creó consentimiento tipo ${tipo} otorgado=${otorgado} para cliente ${clienteId}`
      });
    }

    res.json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
