'use strict';

const { tallerFacade } = require('../container');

class ClienteController {
  async crear(req, res, next) {
    try {
      const cliente = await tallerFacade.crearCliente(req.body);
      res.status(201).json({ success: true, data: cliente, message: 'Cliente creado' });
    } catch (err) { next(err); }
  }

  async actualizar(req, res, next) {
    try {
      const cliente = await tallerFacade.actualizarCliente(req.params.id, req.body);
      res.json({ success: true, data: cliente, message: 'Cliente actualizado' });
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const clientes = await tallerFacade.listarClientes();
      res.json({ success: true, data: clientes, message: 'OK' });
    } catch (err) { next(err); }
  }

  async obtener(req, res, next) {
    try {
      const cliente = await tallerFacade.obtenerCliente(req.params.id);
      if (!cliente) return res.status(404).json({ success: false, data: null, message: 'Cliente no encontrado' });
      res.json({ success: true, data: cliente, message: 'OK' });
    } catch (err) { next(err); }
  }

  async historial(req, res, next) {
    try {
      const ordenes = await tallerFacade.listarOrdenes({ clienteId: req.params.id });
      res.json({ success: true, data: ordenes, message: 'OK' });
    } catch (err) { next(err); }
  }
}

module.exports = new ClienteController();
