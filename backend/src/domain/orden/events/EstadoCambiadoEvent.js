'use strict';

const DomainEvent = require('./DomainEvent');

/**
 * EstadoCambiadoEvent — Domain Event (DDD Táctico)
 *
 * Emitido cada vez que la OrdenServicio cambia de estado.
 * Dispara notificaciones (SMS, email) y registro en bitácora.
 * Es el principal disparador del patrón Observer en este sistema.
 */
class EstadoCambiadoEvent extends DomainEvent {
  /**
   * @param {object} params
   * @param {string} params.ordenId
   * @param {string} params.clienteId
   * @param {string} params.estadoAnterior
   * @param {string} params.estadoNuevo
   * @param {string} [params.mecanicoId]
   */
  constructor({ ordenId, clienteId, estadoAnterior, estadoNuevo, mecanicoId }) {
    super('EstadoCambiado', ordenId);
    this.ordenId        = ordenId;
    this.clienteId      = clienteId;
    this.estadoAnterior = estadoAnterior;
    this.estadoNuevo    = estadoNuevo;
    this.mecanicoId     = mecanicoId || null;
    Object.freeze(this);
  }
}

module.exports = EstadoCambiadoEvent;
