'use strict';

const EstadoOrden        = require('./EstadoOrden');
const EstadoPresupuestada = require('./EstadoPresupuestada');

/**
 * EstadoEnDiagnostico — Estado de diagnóstico (Patrón State)
 *
 * Transición permitida: avanzar() → EstadoPresupuestada
 */
class EstadoEnDiagnostico extends EstadoOrden {
  avanzar(orden) {
    orden._cambiarEstado(new EstadoPresupuestada());
  }

  nombre() {
    return 'EN_DIAGNOSTICO';
  }
}

module.exports = EstadoEnDiagnostico;
