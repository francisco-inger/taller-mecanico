'use strict';

const Servicio = require('./Servicio');

/**
 * ServicioMantenimiento — Tipo de servicio (Patrón Factory Method)
 * Precio fijo sin recargo adicional.
 */
class ServicioMantenimiento extends Servicio {
  calcularTotal() {
    return this.costo; // precio fijo
  }

  tipo() {
    return 'mantenimiento';
  }
}

module.exports = ServicioMantenimiento;
