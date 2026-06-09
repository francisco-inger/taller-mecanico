'use strict';

/**
 * DescuentoPromocion — Patrón Strategy
 * Aplica un monto fijo de descuento (no puede exceder el subtotal).
 */
class DescuentoPromocion {
  /**
   * @param {number} montoFijo - Monto en RD$ a descontar
   */
  constructor(montoFijo) {
    if (montoFijo < 0) {
      throw new Error('DescuentoPromocion: el monto debe ser positivo');
    }
    this.montoFijo = montoFijo;
  }

  calcular(subtotal) {
    return Math.min(this.montoFijo, subtotal);
  }

  descripcion() {
    return `Promoción — RD$ ${this.montoFijo.toFixed(2)} de descuento`;
  }
}

module.exports = DescuentoPromocion;
