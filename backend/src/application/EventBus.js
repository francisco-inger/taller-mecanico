'use strict';

/**
 * EventBus — Patrón Observer
 *
 * Bus de eventos in-process que conecta Domain Events con handlers (observadores).
 * Los observadores se suscriben por tipo de evento y son notificados asincrónicamente.
 *
 * SOLID:
 *  - OCP: agregar nuevos handlers no modifica el bus
 *  - DIP: los handlers dependen del contrato { manejar(evento) }, no del bus
 *  - SRP: única responsabilidad — publicar eventos a handlers registrados
 *
 * @example
 * const bus = new EventBus();
 * bus.suscribir('EstadoCambiado', new NotificadorSMS(cliente));
 * bus.suscribir('EstadoCambiado', new BitacoraAuditoria());
 * await bus.publicar(evento);
 */
class EventBus {
  constructor() {
    /** @type {Map<string, Array<{manejar(e: any): Promise<void>}>>} */
    this._handlers = new Map();
  }

  /**
   * Registra un handler para un tipo de evento.
   *
   * @param {string} nombreEvento - Nombre del evento (ej: 'EstadoCambiado')
   * @param {{ manejar(evento: any): Promise<void> }} handler - Observador concreto
   */
  suscribir(nombreEvento, handler) {
    if (typeof handler.manejar !== 'function') {
      throw new Error(`EventBus: el handler para "${nombreEvento}" debe implementar manejar(evento)`);
    }
    if (!this._handlers.has(nombreEvento)) {
      this._handlers.set(nombreEvento, []);
    }
    this._handlers.get(nombreEvento).push(handler);
  }

  /**
   * Publica un evento a todos los handlers suscritos.
   * Los errores en un handler no bloquean los demás.
   *
   * @param {import('../domain/orden/events/DomainEvent')} evento
   */
  async publicar(evento) {
    const nombreEvento = evento.nombre;
    const handlers     = this._handlers.get(nombreEvento) || [];

    for (const handler of handlers) {
      try {
        await handler.manejar(evento);
      } catch (err) {
        console.error(`[EventBus] Error en handler para "${nombreEvento}":`, err.message);
      }
    }
  }

  /**
   * Publica múltiples eventos en secuencia.
   * @param {import('../domain/orden/events/DomainEvent')[]} eventos
   */
  async publicarTodos(eventos) {
    for (const evento of eventos) {
      await this.publicar(evento);
    }
  }

  /**
   * Retorna los nombres de los eventos con handlers registrados.
   * @returns {string[]}
   */
  eventosRegistrados() {
    return [...this._handlers.keys()];
  }
}

module.exports = EventBus;
