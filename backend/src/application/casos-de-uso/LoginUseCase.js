'use strict';

const bcrypt = require('bcryptjs');

/**
 * LoginUseCase — Caso de Uso de Autenticación
 *
 * Verifica credenciales y retorna un token JWT.
 *
 * SOLID: SRP — única responsabilidad: autenticar un usuario
 */
class LoginUseCase {
  /**
   * @param {import('../../infrastructure/persistence/UsuarioRepository')} usuarioRepo
   * @param {import('../../infrastructure/auth/JwtAdapter')} jwtAdapter
   */
  constructor(usuarioRepo, jwtAdapter) {
    this._usuarioRepo = usuarioRepo;
    this._jwtAdapter  = jwtAdapter;
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, usuario: object}>}
   */
  async ejecutar(email, password) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const usuario = await this._usuarioRepo.obtenerPorEmail(email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    if (!usuario.activo) {
      throw new Error('El usuario está inactivo. Contacte al administrador.');
    }

    const passwordValida = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordValida) {
      throw new Error('Credenciales inválidas');
    }

    const payload = {
      id:     usuario.id,
      email:  usuario.email,
      rol:    usuario.rol,
      nombre: usuario.nombre,
    };

    const token = this._jwtAdapter.firmar(payload);

    return {
      token,
      usuario: {
        id:     usuario.id,
        nombre: usuario.nombre,
        email:  usuario.email,
        rol:    usuario.rol,
      },
    };
  }
}

module.exports = LoginUseCase;
