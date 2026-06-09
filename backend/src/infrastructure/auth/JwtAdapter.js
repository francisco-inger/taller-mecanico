'use strict';

const jwt = require('jsonwebtoken');

/**
 * JwtAdapter — Adaptador de autenticación JWT
 *
 * Encapsula la librería jsonwebtoken.
 * Si en el futuro se migra a Keycloak, solo se reemplaza este adaptador.
 *
 * SOLID: DIP — la aplicación depende de un contrato, no de la librería JWT
 */
class JwtAdapter {
  /**
   * @param {string} secret - Clave secreta para firmar tokens
   * @param {string} expiresIn - Tiempo de expiración (ej: '8h')
   */
  constructor(secret, expiresIn) {
    if (!secret) throw new Error('JwtAdapter: JWT_SECRET es requerido');
    this._secret    = secret;
    this._expiresIn = expiresIn || '8h';
  }

  /**
   * Firma un payload y retorna el token JWT.
   * @param {object} payload
   * @returns {string}
   */
  firmar(payload) {
    return jwt.sign(payload, this._secret, { expiresIn: this._expiresIn });
  }

  /**
   * Verifica y decodifica un token JWT.
   * @param {string} token
   * @returns {object} Payload decodificado
   * @throws {Error} Si el token es inválido o expiró
   */
  verificar(token) {
    try {
      return jwt.verify(token, this._secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new Error('El token ha expirado. Inicia sesión nuevamente.');
      }
      throw new Error('Token inválido o malformado.');
    }
  }
}

module.exports = JwtAdapter;
