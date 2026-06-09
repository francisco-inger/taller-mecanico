'use strict';

/**
 * RechazarPresupuestoUseCase — Caso de Uso
 * El cliente rechaza el presupuesto: Presupuestada → Rechazada.
 */
class RechazarPresupuestoUseCase {
  constructor(ordenRepo, eventBus) {
    this._ordenRepo = ordenRepo;
    this._eventBus  = eventBus;
  }

  async ejecutar(ordenId) {
    const orden = await this._ordenRepo.obtenerPorId(ordenId);
    if (!orden) throw new Error(`Orden "${ordenId}" no encontrada`);
    if (orden.estado !== 'PRESUPUESTADA') {
      throw new Error(`Solo se puede rechazar una orden en estado PRESUPUESTADA. Estado actual: ${orden.estado}`);
    }

    orden.rechazar(); // PRESUPUESTADA → RECHAZADA
    await this._ordenRepo.guardar(orden);

    const eventos = orden.pullEvents();
    await this._eventBus.publicarTodos(eventos);

    return orden.toJSON();
  }
}

module.exports = RechazarPresupuestoUseCase;
