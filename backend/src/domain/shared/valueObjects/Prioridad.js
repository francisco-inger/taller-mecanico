'use strict';

/**
 * Prioridad — Value Object (DDD Táctico)
 *
 * Representa el nivel de prioridad de una OrdenServicio.
 * Valores permitidos: NORMAL | URGENTE | VIP
 *
 * SOLID:
 *  - SRP: única responsabilidad — representar y validar una prioridad
 *  - Inmutable: Object.freeze()
 */
class Prioridad {
  static VALORES_VALIDOS = ['NORMAL', 'URGENTE', 'VIP'];

  static NORMAL  = new Prioridad('NORMAL');
  static URGENTE = new Prioridad('URGENTE');
  static VIP     = new Prioridad('VIP');

  /** @type {string} */
  #value;

  /**
   * @param {string} value
   * @throws {Error} Si el valor no es un nivel de prioridad válido
   */
  constructor(value) {
    if (!Prioridad.VALORES_VALIDOS.includes(value)) {
      throw new Error(
        `Prioridad inválida: "${value}". Valores permitidos: ${Prioridad.VALORES_VALIDOS.join(', ')}`
      );
    }
    this.#value = value;
    Object.freeze(this);
  }

  /**
   * Construye una Prioridad desde un string.
   * @param {string} value
   * @returns {Prioridad}
   */
  static desde(value) {
    return new Prioridad(value.toUpperCase());
  }

  /** @returns {string} */
  get value() {
    return this.#value;
  }

  /** @returns {boolean} */
  esUrgente() {
    return this.#value === 'URGENTE';
  }

  /** @returns {boolean} */
  esVIP() {
    return this.#value === 'VIP';
  }

  /**
   * Compara igualdad por valor (Value Object).
   * @param {Prioridad} otra
   * @returns {boolean}
   */
  equals(otra) {
    return otra instanceof Prioridad && otra.#value === this.#value;
  }

  toString() {
    return this.#value;
  }
}

module.exports = Prioridad;
