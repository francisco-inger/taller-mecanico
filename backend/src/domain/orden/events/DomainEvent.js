'use strict';

/**
 * DomainEvent — Clase base para todos los Domain Events (DDD Táctico)
 *
 * Los Domain Events representan algo que ocurrió dentro del dominio.
 * Son inmutables y contienen toda la información relevante del momento.
 *
 * SOLID:
 *  - OCP: subclases concretas extienden sin modificar esta base
 */
class DomainEvent {
  /**
   * @param {string} nombre - Nombre del evento (ej: 'OrdenCreada')
   * @param {string} agregadoId - ID del aggregate que emitió el evento
   */
  constructor(nombre, agregadoId) {
    this.nombre       = nombre;
    this.agregadoId   = agregadoId;
    this.ocurridoEn   = new Date();
    this.eventId      = `EVT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

module.exports = DomainEvent;
