'use strict';

const EstadoOrden        = require('./EstadoOrden');
const EstadoEnDiagnostico = require('./EstadoEnDiagnostico');

/**
 * EstadoRecibida — Estado inicial de la orden (Patrón State)
 *
 * Transición permitida: avanzar() → EstadoEnDiagnostico
 */
class EstadoRecibida extends EstadoOrden {
  avanzar(orden) {
    orden._cambiarEstado(new EstadoEnDiagnostico());
  }

  nombre() {
    return 'RECIBIDA';
  }
}

module.exports = EstadoRecibida;
