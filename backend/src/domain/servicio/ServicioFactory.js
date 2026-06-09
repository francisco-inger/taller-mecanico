'use strict';

const ServicioMantenimiento = require('./ServicioMantenimiento');
const ServicioReparacion    = require('./ServicioReparacion');
const ServicioDiagnostico   = require('./ServicioDiagnostico');

/**
 * ServicioFactory — Patrón Factory Method
 *
 * Crea instancias del tipo correcto de Servicio según el tipo recibido.
 * Centraliza la lógica de creación; el cliente solo conoce la fábrica.
 *
 * SOLID:
 *  - OCP: agregar un nuevo tipo de servicio = agregar un case, sin modificar clientes
 *  - SRP: única responsabilidad — instanciar servicios
 *  - DIP: los clientes dependen de Servicio (abstracción), no de subclases
 *
 * @example
 * const srv = ServicioFactory.crear('mantenimiento', {
 *   descripcion: 'Cambio de aceite 5W-30',
 *   costo: 800,
 *   tiempoEstimado: 30
 * });
 */
class ServicioFactory {
  /**
   * Tipos de servicio soportados.
   * @type {string[]}
   */
  static TIPOS_VALIDOS = ['mantenimiento', 'reparacion', 'diagnostico'];

  /**
   * Crea un Servicio del tipo indicado.
   *
   * @param {'mantenimiento'|'reparacion'|'diagnostico'} tipo
   * @param {{descripcion:string, costo:number, tiempoEstimado:number}} datos
   * @returns {import('./Servicio')}
   * @throws {Error} Si el tipo no es reconocido
   */
  static crear(tipo, datos) {
    switch (tipo.toLowerCase()) {
      case 'mantenimiento':
        return new ServicioMantenimiento(datos);

      case 'reparacion':
        return new ServicioReparacion(datos);

      case 'diagnostico':
        return new ServicioDiagnostico(datos);

      default:
        throw new Error(
          `ServicioFactory: tipo desconocido "${tipo}". Tipos válidos: ${ServicioFactory.TIPOS_VALIDOS.join(', ')}`
        );
    }
  }
}

module.exports = ServicioFactory;
