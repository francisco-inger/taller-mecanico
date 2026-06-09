'use strict';

const EstadoOrden  = require('./EstadoOrden');
const EstadoAprobada  = require('./EstadoAprobada');
const EstadoRechazada = require('./EstadoRechazada');

/**
 * EstadoPresupuestada — Estado de presupuesto (Patrón State)
 *
 * Transiciones permitidas:
 *   avanzar()  → EstadoAprobada  (cliente aprueba el presupuesto)
 *   rechazar() → EstadoRechazada (cliente rechaza el presupuesto)
 *
 * Este es el único estado que permite rechazo.
 */
class EstadoPresupuestada extends EstadoOrden {
  avanzar(orden) {
    orden._cambiarEstado(new EstadoAprobada());
  }

  rechazar(orden) {
    orden._cambiarEstado(new EstadoRechazada());
  }

  nombre() {
    return 'PRESUPUESTADA';
  }
}

module.exports = EstadoPresupuestada;
