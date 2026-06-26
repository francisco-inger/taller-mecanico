'use strict';

const { tallerFacade } = require('../container');

class FacturaController {
  async listar(req, res, next) {
    try {
      const facturas = await tallerFacade.listarFacturas();
      res.json({ success: true, data: facturas, message: 'OK' });
    } catch (err) { next(err); }
  }

  async obtener(req, res, next) {
    try {
      const factura = await tallerFacade.obtenerFactura(req.params.id);
      if (!factura) return res.status(404).json({ success: false, message: 'Factura no encontrada' });
      res.json({ success: true, data: factura, message: 'OK' });
    } catch (err) { next(err); }
  }

  async crear(req, res, next) {
    try {
      const { ordenId, descuento, descripDescuento } = req.body;
      const { factura, resumen } = await tallerFacade.generarFactura(ordenId, descuento, descripDescuento);
      res.status(201).json({ success: true, data: { factura, resumen }, message: 'Factura generada con éxito' });
    } catch (err) { next(err); }
  }

  async actualizar(req, res, next) {
    try {
      const factura = await tallerFacade.actualizarFactura(req.params.id, req.body);
      res.json({ success: true, data: factura, message: 'Factura actualizada' });
    } catch (err) { next(err); }
  }

  async eliminar(req, res, next) {
    try {
      await tallerFacade.eliminarFactura(req.params.id);
      res.json({ success: true, data: null, message: 'Factura eliminada' });
    } catch (err) { next(err); }
  }
}

module.exports = new FacturaController();
