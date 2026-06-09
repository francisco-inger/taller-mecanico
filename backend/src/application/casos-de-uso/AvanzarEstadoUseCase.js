'use strict';

/**
 * AvanzarEstadoUseCase — Caso de Uso
 *
 * Avanza el estado de una OrdenServicio al siguiente en el ciclo de vida.
 * Publica EstadoCambiadoEvent para notificaciones.
 *
 * SOLID: SRP — única responsabilidad: avanzar el estado de una orden
 */
class AvanzarEstadoUseCase {
  constructor(ordenRepo, eventBus) {
    this._ordenRepo = ordenRepo;
    this._eventBus  = eventBus;
  }

  /**
   * @param {string} ordenId
   * @returns {Promise<object>}
   */
  async ejecutar(ordenId) {
    const orden = await this._ordenRepo.obtenerPorId(ordenId);
    if (!orden) throw new Error(`Orden "${ordenId}" no encontrada`);

    if (orden.estadoObj.esTerminal()) {
      throw new Error(`La orden "${ordenId}" está en estado terminal: ${orden.estado}`);
    }

    orden.avanzar();
    await this._ordenRepo.guardar(orden);

    const eventos = orden.pullEvents();
    await this._eventBus.publicarTodos(eventos);

    return orden.toJSON();
  }
}

module.exports = AvanzarEstadoUseCase;
