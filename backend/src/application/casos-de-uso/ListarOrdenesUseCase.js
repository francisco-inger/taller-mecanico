'use strict';

/**
 * ListarOrdenesUseCase — Caso de Uso
 * Retorna órdenes filtradas por estado, mecánico o fecha.
 */
class ListarOrdenesUseCase {
  constructor(ordenRepo) {
    this._ordenRepo = ordenRepo;
  }

  /**
   * @param {{estado?:string, mecanicoId?:string, clienteId?:string}} filtros
   * @returns {Promise<object[]>}
   */
  async ejecutar(filtros = {}) {
    return this._ordenRepo.listar(filtros);
  }
}

module.exports = ListarOrdenesUseCase;
