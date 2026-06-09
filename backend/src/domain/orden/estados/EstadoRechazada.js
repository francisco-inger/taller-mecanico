'use strict';

const EstadoOrden = require('./EstadoOrden');

/**
 * EstadoRechazada — Estado terminal: presupuesto rechazado (Patrón State)
 *
 * Estado terminal. El cliente no aprobó el presupuesto.
 */
class EstadoRechazada extends EstadoOrden {
  avanzar(orden) {
    throw new Error('La orden está RECHAZADA. No se permiten más transiciones.');
  }

  nombre() {
    return 'RECHAZADA';
  }

  esTerminal() {
    return true;
  }
}

module.exports = EstadoRechazada;
