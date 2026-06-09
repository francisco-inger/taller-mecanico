'use strict';

const EstadoOrden    = require('./EstadoOrden');
const EstadoFacturada = require('./EstadoFacturada');

/**
 * EstadoEntregada — Vehículo entregado al cliente (Patrón State)
 *
 * Transición permitida: avanzar() → EstadoFacturada
 */
class EstadoEntregada extends EstadoOrden {
  avanzar(orden) {
    orden.fechaEntregaReal = new Date();
    orden._cambiarEstado(new EstadoFacturada());
  }

  nombre() {
    return 'ENTREGADA';
  }
}

module.exports = EstadoEntregada;
