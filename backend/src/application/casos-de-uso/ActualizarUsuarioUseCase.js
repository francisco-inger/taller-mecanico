'use strict';

const bcrypt = require('bcryptjs');

/**
 * ActualizarUsuarioUseCase — Caso de Uso
 */
class ActualizarUsuarioUseCase {
  constructor(usuarioRepo) {
    this._usuarioRepo = usuarioRepo;
  }

  async ejecutar(id, datos) {
    if (!id) throw new Error('ID de usuario es requerido');

    // Verificar si existe
    const usuario = await this._usuarioRepo.obtenerPorId(id);
    if (!usuario) throw new Error('Usuario no encontrado');

    const updateData = { ...datos };

    // Si se envía password, hashearlo
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    } else {
      delete updateData.password;
    }

    // Verificar email duplicado si cambia
    if (updateData.email && updateData.email !== usuario.email) {
      const existente = await this._usuarioRepo.obtenerPorEmail(updateData.email);
      if (existente) throw new Error('El email ya está en uso por otro usuario');
    }

    return this._usuarioRepo.actualizar(id, updateData);
  }
}

module.exports = ActualizarUsuarioUseCase;
