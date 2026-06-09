'use strict';

/**
 * OrdenId — Value Object (DDD Táctico)
 *
 * Representa el identificador único e inmutable de una OrdenServicio.
 * Formato: OS-YYYYMMDD-XXXX
 *
 * SOLID:
 *  - SRP: única responsabilidad — representar y validar un OrdenId
 *  - OCP: no necesita modificarse para nuevos contextos de uso
 */
class OrdenId {
  /** @type {string} */
  #value;

  /**
   * @param {string} value - Identificador en formato OS-YYYYMMDD-XXXX
   * @throws {Error} Si el valor es nulo o no cumple el formato
   */
  constructor(value) {
    if (!value || typeof value !== 'string') {
      throw new Error('OrdenId: el valor debe ser una cadena no vacía');
    }
    const formato = /^OS-\d{8}-\d{4}$/;
    if (!formato.test(value)) {
      throw new Error(`OrdenId: formato inválido "${value}". Esperado: OS-YYYYMMDD-XXXX`);
    }
    this.#value = value;
    Object.freeze(this);
  }

  /**
   * Genera un nuevo OrdenId único basado en la fecha actual.
   * @returns {OrdenId}
   */
  static generar() {
    const ahora = new Date();
    const fecha = ahora.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return new OrdenId(`OS-${fecha}-${seq}`);
  }

  /**
   * Reconstruye un OrdenId desde un valor existente (ej: desde la BD).
   * @param {string} value
   * @returns {OrdenId}
   */
  static desde(value) {
    return new OrdenId(value);
  }

  /** @returns {string} */
  get value() {
    return this.#value;
  }

  /**
   * Compara igualdad por valor (Value Object).
   * @param {OrdenId} otro
   * @returns {boolean}
   */
  equals(otro) {
    return otro instanceof OrdenId && otro.#value === this.#value;
  }

  toString() {
    return this.#value;
  }
}

module.exports = OrdenId;
