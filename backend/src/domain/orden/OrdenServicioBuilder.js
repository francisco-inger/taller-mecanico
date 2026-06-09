'use strict';

const OrdenServicio = require('./OrdenServicio');
const OrdenId       = require('../shared/valueObjects/OrdenId');

/**
 * OrdenServicioBuilder — Patrón Builder
 *
 * Construye OrdenServicio paso a paso, validando al final.
 * Permite construir órdenes con muchos campos opcionales de forma fluida.
 *
 * SOLID:
 *  - SRP: única responsabilidad — construir objetos OrdenServicio
 *  - OCP: agregar nuevos campos no rompe código existente
 *
 * @example
 * const orden = new OrdenServicioBuilder()
 *   .conCliente('uuid-cliente')
 *   .conVehiculo('uuid-vehiculo')
 *   .conPrioridad('URGENTE')
 *   .agregarServicio(cambioAceite)
 *   .agregarRepuesto({ nombre: 'Filtro aceite', precio: 250, cantidad: 1 })
 *   .conNotas('Cliente reporta ruido al frenar')
 *   .construir();
 */
class OrdenServicioBuilder {
  constructor() {
    this._clienteId           = null;
    this._vehiculoId          = null;
    this._mecanicoId          = null;
    this._prioridad           = 'NORMAL';
    this._servicios           = [];
    this._repuestos           = [];
    this._notas               = '';
    this._fechaEntregaEstimada = null;
  }

  /**
   * @param {string} clienteId
   * @returns {this}
   */
  conCliente(clienteId) {
    this._clienteId = clienteId;
    return this;
  }

  /**
   * @param {string} vehiculoId
   * @returns {this}
   */
  conVehiculo(vehiculoId) {
    this._vehiculoId = vehiculoId;
    return this;
  }

  /**
   * @param {string} mecanicoId
   * @returns {this}
   */
  asignarMecanico(mecanicoId) {
    this._mecanicoId = mecanicoId;
    return this;
  }

  /**
   * @param {'NORMAL'|'URGENTE'|'VIP'} prioridad
   * @returns {this}
   */
  conPrioridad(prioridad) {
    this._prioridad = prioridad;
    return this;
  }

  /**
   * @param {import('../servicio/Servicio')} servicio
   * @returns {this}
   */
  agregarServicio(servicio) {
    this._servicios.push(servicio);
    return this;
  }

  /**
   * @param {{nombre:string, precio:number, cantidad:number}} repuesto
   * @returns {this}
   */
  agregarRepuesto(repuesto) {
    this._repuestos.push(repuesto);
    return this;
  }

  /**
   * @param {string} notas
   * @returns {this}
   */
  conNotas(notas) {
    this._notas = notas;
    return this;
  }

  /**
   * @param {Date|string} fecha
   * @returns {this}
   */
  conEntregaEstimada(fecha) {
    this._fechaEntregaEstimada = fecha ? new Date(fecha) : null;
    return this;
  }

  /**
   * Valida los campos requeridos y retorna la OrdenServicio construida.
   * @returns {OrdenServicio}
   * @throws {Error} Si faltan campos obligatorios
   */
  construir() {
    if (!this._clienteId)  throw new Error('Builder: clienteId es requerido');
    if (!this._vehiculoId) throw new Error('Builder: vehiculoId es requerido');
    if (this._servicios.length === 0) {
      throw new Error('Builder: al menos un servicio es requerido');
    }

    return OrdenServicio.crear({
      clienteId:           this._clienteId,
      vehiculoId:          this._vehiculoId,
      mecanicoId:          this._mecanicoId,
      prioridad:           this._prioridad,
      servicios:           this._servicios,
      repuestos:           this._repuestos,
      notas:               this._notas,
      fechaEntregaEstimada: this._fechaEntregaEstimada,
    });
  }
}

module.exports = OrdenServicioBuilder;
