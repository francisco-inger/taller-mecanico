'use strict';

const EstadoOrden      = require('./EstadoOrden');
const EstadoEnReparacion = require('./EstadoEnReparacion');

/**
 * EstadoAprobada — Presupuesto aprobado (Patrón State)
 *
 * Transición permitida: avanzar() → EstadoEnReparacion
 */
class EstadoAprobada extends EstadoOrden {
  avanzar(orden) {
    orden._cambiarEstado(new EstadoEnReparacion());
  }

  nombre() {
    return 'APROBADA';
  }
}

module.exports = EstadoAprobada;
