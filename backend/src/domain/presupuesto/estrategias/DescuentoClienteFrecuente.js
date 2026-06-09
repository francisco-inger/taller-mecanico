'use strict';

/**
 * DescuentoClienteFrecuente — Patrón Strategy
 * Aplica 10% de descuento a clientes marcados como frecuentes.
 */
class DescuentoClienteFrecuente {
  static PORCENTAJE = 0.10;

  calcular(subtotal) {
    return subtotal * DescuentoClienteFrecuente.PORCENTAJE;
  }

  descripcion() {
    return 'Descuento cliente frecuente (10%)';
  }
}

module.exports = DescuentoClienteFrecuente;
