'use strict';

const Servicio = require('./Servicio');

/**
 * ServicioDiagnostico — Tipo de servicio (Patrón Factory Method)
 * Costo base + tarifa fija de diagnóstico electrónico (RD$ 200).
 */
class ServicioDiagnostico extends Servicio {
  static TARIFA_DIAGNOSTICO = 200; // RD$ fijo por diagnóstico

  calcularTotal() {
    return this.costo + ServicioDiagnostico.TARIFA_DIAGNOSTICO;
  }

  tipo() {
    return 'diagnostico';
  }
}

module.exports = ServicioDiagnostico;
