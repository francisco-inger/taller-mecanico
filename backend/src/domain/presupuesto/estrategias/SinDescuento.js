'use strict';

/**
 * SinDescuento — Estrategia por defecto (Patrón Strategy)
 */
class SinDescuento {
  calcular(subtotal) { return 0; }
  descripcion()      { return 'Sin descuento'; }
}

module.exports = SinDescuento;
