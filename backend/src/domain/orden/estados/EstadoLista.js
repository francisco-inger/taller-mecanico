'use strict';

const EstadoOrden    = require('./EstadoOrden');
const EstadoEntregada = require('./EstadoEntregada');

/**
 * EstadoLista — Vehículo listo para entrega (Patrón State)
 *
 * Transición permitida: avanzar() → EstadoEntregada
 */
class EstadoLista extends EstadoOrden {
  avanzar(orden) {
    orden._cambiarEstado(new EstadoEntregada());
  }

  nombre() {
    return 'LISTA';
  }
}

module.exports = EstadoLista;
