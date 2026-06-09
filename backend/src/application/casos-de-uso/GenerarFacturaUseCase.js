'use strict';

const CalculadoraOrden          = require('../../domain/presupuesto/CalculadoraOrden');
const DescuentoClienteFrecuente = require('../../domain/presupuesto/estrategias/DescuentoClienteFrecuente');
const SinDescuento              = require('../../domain/presupuesto/estrategias/SinDescuento');

/**
 * GenerarFacturaUseCase — Caso de Uso
 *
 * Genera la factura de una orden en estado ENTREGADA.
 * Calcula el total final con ITBIS 18% y lo persiste.
 */
class GenerarFacturaUseCase {
  constructor(ordenRepo, clienteRepo, facturaRepo, eventBus) {
    this._ordenRepo   = ordenRepo;
    this._clienteRepo = clienteRepo;
    this._facturaRepo = facturaRepo;
    this._eventBus    = eventBus;
  }

  async ejecutar(ordenId) {
    const orden = await this._ordenRepo.obtenerPorId(ordenId);
    if (!orden) throw new Error(`Orden "${ordenId}" no encontrada`);

    if (orden.estado !== 'ENTREGADA') {
      throw new Error(`Solo se puede facturar una orden en estado ENTREGADA. Estado actual: ${orden.estado}`);
    }

    const cliente   = await this._clienteRepo.obtenerPorId(orden.clienteId);
    const estrategia = cliente && cliente.esFrecuente
      ? new DescuentoClienteFrecuente()
      : new SinDescuento();

    const calculadora = new CalculadoraOrden(estrategia);
    const resumen     = calculadora.calcularTotal(orden.servicios, orden.repuestos);

    // Avanzar a estado FACTURADA
    orden.avanzar();
    await this._ordenRepo.guardar(orden);

    // Crear factura
    const factura = await this._facturaRepo.crear({
      ordenId:          orden.id.toString(),
      subtotal:         resumen.subtotal,
      descuento:        resumen.descuento,
      itbis:            resumen.itbis,
      total:            resumen.total,
      descripDescuento: resumen.descuentoDescripcion,
    });

    const eventos = orden.pullEvents();
    await this._eventBus.publicarTodos(eventos);

    return { factura, resumen };
  }
}

module.exports = GenerarFacturaUseCase;
