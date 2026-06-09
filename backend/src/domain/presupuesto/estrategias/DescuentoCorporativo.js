'use strict';

/**
 * DescuentoCorporativo — Patrón Strategy
 * Aplica un porcentaje configurable para convenios corporativos.
 */
class DescuentoCorporativo {
  /**
   * @param {number} porcentaje - Ej: 15 para 15%
   */
  constructor(porcentaje) {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new Error('DescuentoCorporativo: porcentaje debe estar entre 0 y 100');
    }
    this.porcentaje = porcentaje;
  }

  calcular(subtotal) {
    return subtotal * (this.porcentaje / 100);
  }

  descripcion() {
    return `Descuento corporativo (${this.porcentaje}%)`;
  }
}

module.exports = DescuentoCorporativo;
