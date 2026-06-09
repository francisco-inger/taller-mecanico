'use strict';

const EstadoOrden = require('./EstadoOrden');

/**
 * EstadoFacturada — Estado final: orden facturada (Patrón State)
 *
 * Estado terminal. No permite ninguna transición adicional.
 */
class EstadoFacturada extends EstadoOrden {
  avanzar(orden) {
    throw new Error('La orden está FACTURADA. No se permiten más transiciones.');
  }

  nombre() {
    return 'FACTURADA';
  }

  esTerminal() {
    return true;
  }
}

module.exports = EstadoFacturada;
