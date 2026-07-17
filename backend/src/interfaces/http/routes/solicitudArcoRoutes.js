'use strict';

const { Router } = require('express');
const { authMiddleware, solicitudArcoRepo } = require('../container');
const logRepo = require('../../../infrastructure/persistence/prisma/PrismaLogRepository');
const requerirRoles = require('../middleware/roleMiddleware');

const router = Router();

// Todas las rutas requieren estar autenticado
router.use(authMiddleware);

/**
 * GET /api/solicitudes-arco
 * Listar solicitudes ARCO (opcionalmente filtrado por clienteId)
 */
router.get('/', async (req, res, next) => {
  try {
    const { clienteId } = req.query;
    let datos;
    if (clienteId) {
      datos = await solicitudArcoRepo.listarPorCliente(clienteId);
    } else {
      datos = await solicitudArcoRepo.listar();
    }
    res.json({ success: true, data: datos });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/solicitudes-arco
 * Crear una nueva solicitud ARCO (derechos de titular Ley 133-21)
 */
router.post('/', requerirRoles('ADMIN', 'RECEPCIONISTA'), async (req, res, next) => {
  try {
    const { clienteId, tipo, descripcion } = req.body;
    
    if (!clienteId || !tipo || !descripcion) {
      return res.status(400).json({ success: false, message: 'clienteId, tipo y descripcion son requeridos' });
    }

    const resultado = await solicitudArcoRepo.crear({
      clienteId,
      tipo,
      descripcion,
      estado: 'PENDIENTE'
    });

    // Auditoría
    await logRepo.crear({
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'CREAR',
      entidad: 'CLIENTE',
      entidadId: clienteId,
      detalle: `Registró solicitud ARCO de tipo ${tipo} para el cliente ${clienteId}`
    });

    res.status(201).json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/solicitudes-arco/:id/estado
 * Actualizar el estado de una solicitud ARCO (Solo Admin)
 */
router.patch('/:id/estado', requerirRoles('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado, respuesta } = req.body;

    if (!estado) {
      return res.status(400).json({ success: false, message: 'El estado es requerido' });
    }

    const resultado = await solicitudArcoRepo.actualizarEstado(id, estado, respuesta);

    // Auditoría
    await logRepo.crear({
      usuarioId: req.user.id,
      usuarioNombre: req.user.nombre,
      usuarioRol: req.user.rol,
      accion: 'ACTUALIZAR',
      entidad: 'CLIENTE',
      entidadId: resultado.clienteId,
      detalle: `Actualizó solicitud ARCO (${id}) al estado ${estado}. Respuesta: ${respuesta || 'Sin respuesta'}`
    });

    res.json({ success: true, data: resultado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
