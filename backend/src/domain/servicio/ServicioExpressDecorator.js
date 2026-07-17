'use strict';

const ServicioDecorator = require('./ServicioDecorator');

/**
 * ServicioExpressDecorator (Patrón Decorator)
 * 
 * Añade un cargo extra por "Servicio Express" y reduce el tiempo estimado (prioridad).
 */
class ServicioExpressDecorator extends ServicioDecorator {
  /**
   * @param {Servicio} servicio 
   * @param {number} cargoExtra - Monto adicional en RD$
   */
  constructor(servicio, cargoExtra = 500) {
    super(servicio);
    this.cargoExtra = cargoExtra;
  }

  /**
   * Añade el cargo extra al total del servicio decorado
   */
  calcularTotal() {
    return this.componente.calcularTotal() + this.cargoExtra;
  }

  /**
   * Modifica la descripción para indicar que es Express
   */
  get descripcion() {
    return `${this.componente.descripcion} (EXPRESS 🚀)`;
  }

  toJSON() {
    return {
      ...this.componente.toJSON(),
      descripcion: this.descripcion,
      total:       this.calcularTotal(),
      esExpress:   true,
      cargoExpress: this.cargoExtra
    };
  }
}

module.exports = ServicioExpressDecorator;
