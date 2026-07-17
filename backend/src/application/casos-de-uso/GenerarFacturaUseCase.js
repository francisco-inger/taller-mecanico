'use strict';

const CalculadoraOrden          = require('../../domain/presupuesto/CalculadoraOrden');
const DescuentoClienteFrecuente = require('../../domain/presupuesto/estrategias/DescuentoClienteFrecuente');
const SinDescuento              = require('../../domain/presupuesto/estrategias/SinDescuento');
const prisma                    = require('../../infrastructure/persistence/prisma/prismaClient');

/**
 * GenerarFacturaUseCase — Caso de Uso
 *
 * Genera la factura de una orden en estado ENTREGADA.
 * Calcula el total final con ITBIS 18% y lo persiste.
 *
 * CORRECCIÓN: Se usa prisma.$transaction para garantizar atomicidad.
 * Si crear la factura falla, el estado de la orden NO queda como FACTURADA.
 *
 * SOLID:
 *  - SRP: única responsabilidad — generar la factura de una orden
 *  - DIP: depende de abstracciones (repositorios), no de implementaciones concretas
 */
class GenerarFacturaUseCase {
  constructor(ordenRepo, clienteRepo, facturaRepo, eventBus) {
    this._ordenRepo   = ordenRepo;
    this._clienteRepo = clienteRepo;
    this._facturaRepo = facturaRepo;
    this._eventBus    = eventBus;
  }

  async ejecutar(ordenId, descuentoManual = null, descripDescuentoManual = null) {
    const orden = await this._ordenRepo.obtenerPorId(ordenId);
    if (!orden) throw new Error(`Orden "${ordenId}" no encontrada`);

    if (orden.estado !== 'ENTREGADA') {
      throw new Error(`Solo se puede facturar una orden en estado ENTREGADA. Estado actual: ${orden.estado}`);
    }

    const totalServicios = orden.servicios.reduce((acc, s) => acc + Number(s.costo), 0);
    const totalRepuestos = orden.repuestos.reduce((acc, r) => acc + (Number(r.precio) * r.cantidad), 0);
    const subtotal       = totalServicios + totalRepuestos;

    let descuento = 0;
    let descuentoDescripcion = '';

    if (descuentoManual !== null && descuentoManual !== undefined) {
      descuento = parseFloat(descuentoManual) || 0;
      descuentoDescripcion = descripDescuentoManual || 'Descuento manual aplicado';
    } else {
      const cliente    = await this._clienteRepo.obtenerPorId(orden.clienteId);
      const estrategia = cliente && cliente.esFrecuente
        ? new DescuentoClienteFrecuente()
        : new SinDescuento();

      const calculadora = new CalculadoraOrden(estrategia);
      const resumen     = calculadora.calcularTotal(orden.servicios, orden.repuestos);
      descuento = resumen.descuento;
      descuentoDescripcion = resumen.descuentoDescripcion;
    }

    const baseImponible = subtotal - descuento;
    const itbis         = parseFloat((baseImponible * 0.18).toFixed(2));
    const total         = parseFloat((baseImponible + itbis).toFixed(2));

    console.log(`[GenerarFactura] Orden=${ordenId} subtotal=${subtotal} descuento=${descuento} itbis=${itbis} total=${total}`);

    // ── Transacción atómica: estado + factura juntos ───────────────────────
    // Si cualquier paso falla, ambos se revierten y la orden queda en ENTREGADA.
    let factura;
    try {
      factura = await prisma.$transaction(async (tx) => {
        // 1. Avanzar estado de la orden a FACTURADA
        await tx.orden.update({
          where: { id: ordenId.toString() },
          data:  { estado: 'FACTURADA' },
        });

        // 2. Crear la factura dentro de la misma transacción
        const nuevaFactura = await tx.factura.create({
          data: {
            ordenId:          ordenId.toString(),
            subtotal,
            descuento,
            itbis,
            total,
            descripDescuento: descuentoDescripcion,
          },
          include: {
            orden: {
              include: { cliente: true, vehiculo: true, servicios: true, repuestos: true }
            }
          }
        });

        console.log(`[GenerarFactura] Factura creada exitosamente: ${nuevaFactura.id}`);
        return nuevaFactura;
      });
    } catch (txError) {
      console.error(`[GenerarFactura] ERROR en transaccion para orden ${ordenId}:`, txError.message);
      throw txError;
    }

    // Publicar eventos de dominio (fuera de la transaccion, no bloquean)
    orden.avanzar();
    const eventos = orden.pullEvents();
    await this._eventBus.publicarTodos(eventos);

    return {
      factura,
      resumen: {
        subtotal,
        descuento,
        itbis,
        total,
        descuentoDescripcion
      }
    };
  }
}

module.exports = GenerarFacturaUseCase;
