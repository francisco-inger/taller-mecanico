'use strict';

/**
 * AprobarPresupuestoUseCase — Caso de Uso
 * El cliente aprueba el presupuesto: Presupuestada → Aprobada.
 */
class AprobarPresupuestoUseCase {
  constructor(ordenRepo, eventBus) {
    this._ordenRepo = ordenRepo;
    this._eventBus  = eventBus;
  }

  async ejecutar(ordenId) {
    const orden = await this._ordenRepo.obtenerPorId(ordenId);
    if (!orden) throw new Error(`Orden "${ordenId}" no encontrada`);
    if (orden.estado !== 'PRESUPUESTADA') {
      throw new Error(`Solo se puede aprobar una orden en estado PRESUPUESTADA. Estado actual: ${orden.estado}`);
    }

    orden.avanzar(); // PRESUPUESTADA → APROBADA
    await this._ordenRepo.guardar(orden);

    const eventos = orden.pullEvents();
    await this._eventBus.publicarTodos(eventos);

    return orden.toJSON();
  }
}

module.exports = AprobarPresupuestoUseCase;
