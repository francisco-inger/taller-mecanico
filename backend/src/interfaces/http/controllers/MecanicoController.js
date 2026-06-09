'use strict';

const { tallerFacade } = require('../container');

class MecanicoController {
  async crear(req, res, next) {
    try {
      const mecanico = await tallerFacade.crearMecanico(req.body);
      res.status(201).json({ success: true, data: mecanico, message: 'Mecánico creado' });
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const mecanicos = await tallerFacade.listarMecanicos();
      res.json({ success: true, data: mecanicos, message: 'OK' });
    } catch (err) { next(err); }
  }

  async actualizar(req, res, next) {
    try {
      const mecanico = await tallerFacade.actualizarMecanico(req.params.id, req.body);
      res.json({ success: true, data: mecanico, message: 'Mecánico actualizado' });
    } catch (err) { next(err); }
  }

  async estadisticas(req, res, next) {
    try {
      const stats = await tallerFacade.obtenerEstadisticasMecanicos();
      res.json({ success: true, data: stats, message: 'OK' });
    } catch (err) { next(err); }
  }
}

module.exports = new MecanicoController();
