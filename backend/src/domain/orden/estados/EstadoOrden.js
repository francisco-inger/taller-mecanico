'use strict';

/**
 * EstadoOrden — Clase base abstracta (Patrón State)
 *
 * Define el contrato que todos los estados concretos deben cumplir.
 * Cada estado concreto sobrescribe los métodos según las transiciones permitidas.
 *
 * SOLID:
 *  - LSP: todos los estados concretos son intercambiables
 *  - OCP: agregar un nuevo estado no modifica esta clase base
 */
class EstadoOrden {
  /**
   * Avanza al siguiente estado del ciclo de vida.
   * @param {import('../OrdenServicio')} orden
   * @throws {Error} Si la acción no está permitida en este estado
   */
  avanzar(orden) {
    throw new Error(
      `La acción "avanzar" no está permitida en el estado "${this.nombre()}"`
    );
  }

  /**
   * Rechaza la orden (solo disponible en estado Presupuestada).
   * @param {import('../OrdenServicio')} orden
   * @throws {Error} Si la acción no está permitida en este estado
   */
  rechazar(orden) {
    throw new Error(
      `La acción "rechazar" no está permitida en el estado "${this.nombre()}"`
    );
  }

  /**
   * Retorna el nombre legible del estado.
   * @returns {string}
   */
  nombre() {
    throw new Error('nombre() debe ser implementado por el estado concreto');
  }

  /**
   * Indica si el estado es un estado terminal (sin transiciones posibles).
   * @returns {boolean}
   */
  esTerminal() {
    return false;
  }

  toString() {
    return this.nombre();
  }
}

module.exports = EstadoOrden;
