'use strict';

const OrdenRepository = require('../OrdenRepository');
const OrdenServicio   = require('../../../domain/orden/OrdenServicio');
const ServicioFactory = require('../../../domain/servicio/ServicioFactory');

/**
 * OrdenRepositoryMemoria — Repositorio en Memoria para Tests
 *
 * Implementación in-memory de OrdenRepository.
 * Permite ejecutar tests de dominio sin necesidad de base de datos.
 *
 * SOLID: LSP — es intercambiable con PrismaOrdenRepository
 */
class OrdenRepositoryMemoria extends OrdenRepository {
  constructor() {
    super();
    /** @type {Map<string, OrdenServicio>} */
    this._ordenes = new Map();
  }

  async obtenerPorId(id) {
    const key = id.toString ? id.toString() : id;
    return this._ordenes.get(key) || null;
  }

  async guardar(orden) {
    const key = orden.id.toString();
    this._ordenes.set(key, orden);
  }

  async listar(filtros = {}) {
    let ordenes = [...this._ordenes.values()];

    if (filtros.estado)     ordenes = ordenes.filter(o => o.estado === filtros.estado);
    if (filtros.mecanicoId) ordenes = ordenes.filter(o => o.mecanicoId === filtros.mecanicoId);
    if (filtros.clienteId)  ordenes = ordenes.filter(o => o.clienteId === filtros.clienteId);

    return ordenes.map(o => o.toJSON());
  }

  async eliminar(id) {
    this._ordenes.delete(id.toString ? id.toString() : id);
  }

  /** Utilidad para tests: vaciar el repositorio */
  limpiar() {
    this._ordenes.clear();
  }

  /** Utilidad para tests: cantidad de órdenes almacenadas */
  count() {
    return this._ordenes.size;
  }
}

module.exports = OrdenRepositoryMemoria;
