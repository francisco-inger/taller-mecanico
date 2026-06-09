'use strict';

const Servicio = require('./Servicio');

/**
 * ServicioReparacion — Tipo de servicio (Patrón Factory Method)
 * Costo base + tarifa por hora técnico (RD$ 500/hora).
 */
class ServicioReparacion extends Servicio {
  static TARIFA_HORA = 500; // RD$ por hora

  calcularTotal() {
    const horas = this.tiempoEstimado / 60;
    return this.costo + horas * ServicioReparacion.TARIFA_HORA;
  }

  tipo() {
    return 'reparacion';
  }
}

module.exports = ServicioReparacion;
