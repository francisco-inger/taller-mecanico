'use strict';

const bcrypt = require('bcryptjs');

/**
 * CrearUsuarioUseCase — Caso de Uso
 */
class CrearUsuarioUseCase {
  constructor(usuarioRepo) {
    this._usuarioRepo = usuarioRepo;
  }

  async ejecutar(datos) {
    const { email, password, nombre, rol } = datos;

    if (!email || !password || !nombre || !rol) {
      throw new Error('Todos los campos son requeridos');
    }

    // Verificar si ya existe
    const existente = await this._usuarioRepo.obtenerPorEmail(email);
    if (existente) {
      throw new Error(`El email "${email}" ya está registrado`);
    }

    // Hash de password
    const passwordHash = await bcrypt.hash(password, 10);

    return this._usuarioRepo.crear({
      nombre,
      email,
      passwordHash,
      rol
    });
  }
}

module.exports = CrearUsuarioUseCase;
