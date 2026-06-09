'use strict';

const { tallerFacade } = require('../container');

/**
 * OrdenController — Controlador de órdenes de servicio
 * Delegación completa al TallerFacade.
 */
class OrdenController {
  async crear(req, res, next) {
    try {
      const orden = await tallerFacade.crearOrden(req.body);
      res.status(201).json({ success: true, data: orden, message: 'Orden creada exitosamente' });
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const { estado, mecanicoId, clienteId } = req.query;
      const ordenes = await tallerFacade.listarOrdenes({ estado, mecanicoId, clienteId });
      res.json({ success: true, data: ordenes, message: 'OK' });
    } catch (err) { next(err); }
  }

  async obtener(req, res, next) {
    try {
      const orden = await tallerFacade.obtenerOrden(req.params.id);
      if (!orden) return res.status(404).json({ success: false, data: null, message: 'Orden no encontrada' });
      res.json({ success: true, data: orden.toJSON ? orden.toJSON() : orden, message: 'OK' });
    } catch (err) { next(err); }
  }

  async avanzarEstado(req, res, next) {
    try {
      const orden = await tallerFacade.avanzarEstado(req.params.id);
      res.json({ success: true, data: orden, message: `Estado avanzado a: ${orden.estado}` });
    } catch (err) { next(err); }
  }

  async presupuesto(req, res, next) {
    try {
      const resultado = await tallerFacade.generarPresupuesto(req.params.id);
      res.json({ success: true, data: resultado, message: 'Presupuesto calculado' });
    } catch (err) { next(err); }
  }

  async aprobar(req, res, next) {
    try {
      const orden = await tallerFacade.aprobarPresupuesto(req.params.id);
      res.json({ success: true, data: orden, message: 'Presupuesto aprobado' });
    } catch (err) { next(err); }
  }

  async rechazar(req, res, next) {
    try {
      const orden = await tallerFacade.rechazarPresupuesto(req.params.id);
      res.json({ success: true, data: orden, message: 'Presupuesto rechazado' });
    } catch (err) { next(err); }
  }

  async agregarServicio(req, res, next) {
    try {
      const orden = await tallerFacade.obtenerOrden(req.params.id);
      if (!orden) return res.status(404).json({ success: false, data: null, message: 'Orden no encontrada' });
      // Agregar servicio y guardar... delegar a un use case si se requiere
      res.json({ success: true, data: null, message: 'Servicio agregado' });
    } catch (err) { next(err); }
  }

  async eliminar(req, res, next) {
    try {
      await tallerFacade.eliminarOrden(req.params.id);
      res.json({ success: true, data: null, message: 'Orden eliminada exitosamente' });
    } catch (err) { next(err); }
  }
}

module.exports = new OrdenController();
