'use strict';

/**
 * Servicio — Clase base para todos los tipos de servicio (Patrón Factory Method)
 *
 * Define la interfaz común de un servicio mecánico.
 *
 * SOLID:
 *  - OCP: subclases concretas extienden sin modificar la base
 *  - LSP: las subclases son intercambiables donde se use Servicio
 */
class Servicio {
  /**
   * @param {object} params
   * @param {string} params.descripcion
   * @param {number} params.costo - Costo base en RD$
   * @param {number} params.tiempoEstimado - Minutos estimados
   */
  constructor({ descripcion, costo, tiempoEstimado }) {
    if (!descripcion) throw new Error('Servicio: descripcion es requerida');
    if (costo < 0)    throw new Error('Servicio: el costo no puede ser negativo');

    this.descripcion    = descripcion;
    this.costo          = costo;
    this.tiempoEstimado = tiempoEstimado || 0;
  }

  /**
   * Calcula el total de este servicio.
   * Puede ser sobreescrito por subclases con lógica propia.
   * @returns {number}
   */
  calcularTotal() {
    return this.costo;
  }

  /**
   * Tipo de servicio. Sobreescrito en subclases.
   * @returns {string}
   */
  tipo() {
    return 'generico';
  }

  toJSON() {
    return {
      tipo:           this.tipo(),
      descripcion:    this.descripcion,
      costo:          this.costo,
      tiempoEstimado: this.tiempoEstimado,
      total:          this.calcularTotal(),
    };
  }
}

module.exports = Servicio;
