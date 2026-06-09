'use strict';

const { tallerFacade } = require('../container');

/**
 * UsuarioController — Controlador para gestión de usuarios (Admin)
 */
class UsuarioController {
  async crear(req, res, next) {
    try {
      const usuario = await tallerFacade.crearUsuario(req.body);
      res.status(201).json({ success: true, data: usuario, message: 'Usuario creado exitosamente' });
    } catch (err) { next(err); }
  }

  async actualizar(req, res, next) {
    try {
      const usuario = await tallerFacade.actualizarUsuario(req.params.id, req.body);
      res.json({ success: true, data: usuario, message: 'Usuario actualizado exitosamente' });
    } catch (err) { next(err); }
  }

  async listar(req, res, next) {
    try {
      const usuarios = await tallerFacade.listarUsuarios();
      res.json({ success: true, data: usuarios, message: 'OK' });
    } catch (err) { next(err); }
  }
}

module.exports = new UsuarioController();
