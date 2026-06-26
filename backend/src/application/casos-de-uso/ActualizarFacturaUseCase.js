'use strict';

/**
 * ActualizarFacturaUseCase — Caso de Uso
 *
 * Actualiza los datos de una factura y recalcula el ITBIS (18%) y el total
 * basándose en el subtotal recalculado de la orden y el nuevo descuento.
 */
class ActualizarFacturaUseCase {
  constructor(facturaRepo, ordenRepo) {
    this._facturaRepo = facturaRepo;
    this._ordenRepo = ordenRepo;
  }

  async ejecutar(id, datos) {
    const factura = await this._facturaRepo.obtenerPorId(id);
    if (!factura) throw new Error(`Factura "${id}" no encontrada`);

    let descuento = factura.descuento;
    let descripDescuento = factura.descripDescuento;

    if (datos.descuento !== undefined && datos.descuento !== null) {
      descuento = parseFloat(datos.descuento) || 0;
    }
    if (datos.descripDescuento !== undefined) {
      descripDescuento = datos.descripDescuento;
    }

    // Obtener la orden asociada para determinar el subtotal real
    const orden = await this._ordenRepo.obtenerPorId(factura.ordenId);
    if (!orden) throw new Error(`Orden "${factura.ordenId}" no encontrada`);

    // Calcular el subtotal sumando los servicios y repuestos registrados en la orden
    const totalServicios = orden.servicios.reduce((acc, s) => acc + Number(s.costo), 0);
    const totalRepuestos = orden.repuestos.reduce((acc, r) => acc + (Number(r.precio) * r.cantidad), 0);
    const subtotal = totalServicios + totalRepuestos;

    const baseImponible = subtotal - descuento;
    const itbis = parseFloat((baseImponible * 0.18).toFixed(2));
    const total = parseFloat((baseImponible + itbis).toFixed(2));

    const datosActualizados = {
      descuento,
      descripDescuento,
      subtotal,
      itbis,
      total
    };

    const facturaActualizada = await this._facturaRepo.actualizar(id, datosActualizados);
    return facturaActualizada;
  }
}

module.exports = ActualizarFacturaUseCase;
