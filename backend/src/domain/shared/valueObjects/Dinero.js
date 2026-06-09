'use strict';

/**
 * Dinero — Value Object (DDD Táctico)
 *
 * Representa un monto monetario en RD$ (pesos dominicanos).
 * Evita errores de punto flotante usando enteros (centavos).
 * Tasa de ITBIS = 18% (República Dominicana).
 *
 * SOLID:
 *  - SRP: maneja aritmética monetaria con precisión
 *  - Inmutable: todos los métodos retornan nuevas instancias
 */
class Dinero {
  static ITBIS_RATE = 0.18;

  /** @type {number} Monto en centavos (entero) */
  #centavos;

  /**
   * @param {number} monto - Monto en RD$ (puede tener decimales)
   * @throws {Error} Si el monto es negativo
   */
  constructor(monto) {
    if (typeof monto !== 'number' || isNaN(monto)) {
      throw new Error('Dinero: el monto debe ser un número');
    }
    if (monto < 0) {
      throw new Error(`Dinero: el monto no puede ser negativo (recibido: ${monto})`);
    }
    // Redondear a 2 decimales para evitar errores de float
    this.#centavos = Math.round(monto * 100);
    Object.freeze(this);
  }

  static CERO = new Dinero(0);

  /**
   * Crea un Dinero desde un valor en RD$.
   * @param {number} monto
   * @returns {Dinero}
   */
  static de(monto) {
    return new Dinero(monto);
  }

  /** @returns {number} Monto en RD$ con 2 decimales */
  get monto() {
    return this.#centavos / 100;
  }

  /**
   * Suma dos montos. Retorna nuevo Dinero (inmutable).
   * @param {Dinero} otro
   * @returns {Dinero}
   */
  sumar(otro) {
    const resultado = new Dinero(0);
    resultado.#centavos = this.#centavos + otro.#centavos;
    return resultado;
  }

  /**
   * Resta otro monto. No puede resultar negativo.
   * @param {Dinero} otro
   * @returns {Dinero}
   */
  restar(otro) {
    const diff = this.#centavos - otro.#centavos;
    if (diff < 0) throw new Error('Dinero: el resultado sería negativo');
    const resultado = new Dinero(0);
    resultado.#centavos = diff;
    return resultado;
  }

  /**
   * Multiplica por un factor decimal.
   * @param {number} factor
   * @returns {Dinero}
   */
  multiplicar(factor) {
    return new Dinero((this.#centavos / 100) * factor);
  }

  /**
   * Calcula el ITBIS (18%) sobre este monto.
   * @returns {Dinero}
   */
  calcularITBIS() {
    return this.multiplicar(Dinero.ITBIS_RATE);
  }

  /**
   * Compara igualdad por valor.
   * @param {Dinero} otro
   * @returns {boolean}
   */
  equals(otro) {
    return otro instanceof Dinero && otro.#centavos === this.#centavos;
  }

  /**
   * Formatea el monto como cadena en RD$.
   * @returns {string} Ej: "RD$ 1,500.00"
   */
  toString() {
    return `RD$ ${this.monto.toLocaleString('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  toJSON() {
    return this.monto;
  }
}

module.exports = Dinero;
