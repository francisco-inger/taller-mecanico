'use strict';

const CalculadoraOrden          = require('../../domain/presupuesto/CalculadoraOrden');
const SinDescuento              = require('../../domain/presupuesto/estrategias/SinDescuento');
const DescuentoClienteFrecuente = require('../../domain/presupuesto/estrategias/DescuentoClienteFrecuente');
const DescuentoCorporativo      = require('../../domain/presupuesto/estrategias/DescuentoCorporativo');
const DescuentoPromocion        = require('../../domain/presupuesto/estrategias/DescuentoPromocion');

/**
 * GenerarPresupuestoUseCase — Caso de Uso
 *
 * Calcula el presupuesto de una orden usando la estrategia de descuento
 * apropiada según el tipo de cliente.
 *
 * SOLID: SRP + OCP (nuevas estrategias sin modificar este use case)
 */
class GenerarPresupuestoUseCase {
  constructor(ordenRepo, clienteRepo, configRepo) {
    this._ordenRepo   = ordenRepo;
    this._clienteRepo = clienteRepo;
    this._configRepo  = configRepo;
  }

  /**
   * @param {string} ordenId
   * @returns {Promise<object>}
   */
  async ejecutar(ordenId) {
    const orden   = await this._ordenRepo.obtenerPorId(ordenId);
    if (!orden) throw new Error(`Orden "${ordenId}" no encontrada`);

    const cliente = await this._clienteRepo.obtenerPorId(orden.clienteId);

    // Selección de estrategia según tipo de cliente
    let estrategia;
    if (cliente && cliente.esFrecuente) {
      estrategia = new DescuentoClienteFrecuente();
    } else {
      estrategia = new SinDescuento();
    }

    const itbisVal = this._configRepo ? await this._configRepo.obtener('itbis_porcentaje') : '18';
    const itbisPorcentaje = itbisVal ? parseFloat(itbisVal) : 18;
    const calculadora = new CalculadoraOrden(estrategia, itbisPorcentaje);
    const resumen     = calculadora.calcularTotal(orden.servicios, orden.repuestos);

    return {
      ordenId:   orden.id.toString(),
      cliente:   { id: cliente.id, nombre: cliente.nombre, esFrecuente: cliente.esFrecuente },
      vehiculo:  orden.vehiculoId,
      servicios: orden.servicios.map(s => s.toJSON ? s.toJSON() : s),
      repuestos: orden.repuestos,
      ...resumen,
    };
  }
}

module.exports = GenerarPresupuestoUseCase;
