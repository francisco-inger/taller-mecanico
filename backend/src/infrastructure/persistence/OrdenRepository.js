'use strict';

/**
 * OrdenRepository — Clase abstracta (interfaz simulada en JS)
 *
 * Define el contrato que todas las implementaciones de repositorio de órdenes
 * deben cumplir. La capa de dominio y aplicación sólo conocen esta abstracción.
 *
 * SOLID: DIP — la aplicación depende de esta abstracción, no de Prisma
 */
class OrdenRepository {
  /** @returns {Promise<import('../../domain/orden/OrdenServicio')>} */
  async obtenerPorId(id) {
    throw new Error('OrdenRepository.obtenerPorId() no implementado');
  }

  /** @returns {Promise<void>} */
  async guardar(orden) {
    throw new Error('OrdenRepository.guardar() no implementado');
  }

  /** @returns {Promise<object[]>} */
  async listar(filtros = {}) {
    throw new Error('OrdenRepository.listar() no implementado');
  }

  /** @returns {Promise<void>} */
  async eliminar(id) {
    throw new Error('OrdenRepository.eliminar() no implementado');
  }
}

module.exports = OrdenRepository;
