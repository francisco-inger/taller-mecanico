'use strict';

const Servicio = require('./Servicio');

/**
 * ServicioDecorator (Patrón Decorator)
 * 
 * Actúa como base para los decoradores de servicios.
 * Mantiene una referencia a un objeto Servicio y delega las llamadas.
 */
class ServicioDecorator extends Servicio {
  /**
   * @param {Servicio} servicio - El servicio a decorar
   */
  constructor(servicio) {
    super({
      descripcion:    servicio.descripcion,
      costo:          servicio.costo,
      tiempoEstimado: servicio.tiempoEstimado
    });
    this.componente = servicio;
  }

  calcularTotal() {
    return this.componente.calcularTotal();
  }

  tipo() {
    return this.componente.tipo();
  }

  toJSON() {
    return {
      ...this.componente.toJSON(),
      decorado: true
    };
  }
}

module.exports = ServicioDecorator;
