'use strict';

const { tallerFacade } = require('../container');

class VehiculoController {
  async crear(req, res, next) {
    try {
      const vehiculo = await tallerFacade.crearVehiculo(req.body);
      res.status(201).json({ success: true, data: vehiculo, message: 'Vehículo registrado' });
    } catch (err) { next(err); }
  }

  async obtener(req, res, next) {
    try {
      const vehiculo = await tallerFacade.obtenerVehiculo(req.params.id);
      if (!vehiculo) return res.status(404).json({ success: false, data: null, message: 'Vehículo no encontrado' });
      res.json({ success: true, data: vehiculo, message: 'OK' });
    } catch (err) { next(err); }
  }

  async porCliente(req, res, next) {
    try {
      const vehiculos = await tallerFacade.listarVehiculos(req.params.clienteId);
      res.json({ success: true, data: vehiculos, message: 'OK' });
    } catch (err) { next(err); }
  }
}

module.exports = new VehiculoController();
