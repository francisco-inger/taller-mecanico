'use strict';

const EstadoOrden  = require('./EstadoOrden');
const EstadoLista  = require('./EstadoLista');

/**
 * EstadoEnReparacion — Vehículo en reparación (Patrón State)
 *
 * Transición permitida: avanzar() → EstadoLista
 */
class EstadoEnReparacion extends EstadoOrden {
  avanzar(orden) {
    orden._cambiarEstado(new EstadoLista());
  }

  nombre() {
    return 'EN_REPARACION';
  }
}

module.exports = EstadoEnReparacion;
