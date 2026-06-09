'use strict';

const DomainEvent = require('./DomainEvent');

/**
 * OrdenCreadaEvent — Domain Event (DDD Táctico)
 *
 * Emitido cuando una OrdenServicio es creada exitosamente.
 * Dispara notificación de recepción al cliente.
 */
class OrdenCreadaEvent extends DomainEvent {
  /**
   * @param {object} params
   * @param {string} params.ordenId - ID de la orden creada
   * @param {string} params.clienteId
   * @param {string} params.vehiculoId
   * @param {string} params.prioridad
   */
  constructor({ ordenId, clienteId, vehiculoId, prioridad }) {
    super('OrdenCreada', ordenId);
    this.ordenId    = ordenId;
    this.clienteId  = clienteId;
    this.vehiculoId = vehiculoId;
    this.prioridad  = prioridad;
    Object.freeze(this);
  }
}

module.exports = OrdenCreadaEvent;
