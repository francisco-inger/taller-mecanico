'use strict';

const SinDescuento = require('./estrategias/SinDescuento');

/**
 * CalculadoraOrden — Contexto del Patrón Strategy
 *
 * Calcula el total de una orden aplicando la estrategia de descuento configurada.
 * Incluye cálculo de ITBIS (18%) según la normativa dominicana.
 *
 * SOLID:
 *  - OCP: nuevas estrategias se agregan sin modificar la calculadora
 *  - DIP: depende de la abstracción (estrategia), no de clases concretas
 *  - SRP: única responsabilidad — calcular precio final de la orden
 *
 * @example
 * const calc = new CalculadoraOrden(new DescuentoClienteFrecuente());
 * const resumen = calc.calcularTotal(orden.servicios, orden.repuestos);
 */
class CalculadoraOrden {
  static ITBIS = 0.18;

  /**
   * @param {object} estrategia - Debe implementar calcular(subtotal) y descripcion()
   */
  constructor(estrategia = new SinDescuento()) {
    this._estrategia = estrategia;
  }

  /**
   * Cambia la estrategia de descuento en tiempo de ejecución.
   * @param {object} estrategia
   */
  setEstrategia(estrategia) {
    this._estrategia = estrategia;
  }

  /**
   * Calcula el total de la orden.
   *
   * @param {import('../servicio/Servicio')[]} servicios
   * @param {Array<{precio:number, cantidad:number}>} repuestos
   * @returns {{
   *   subtotal: number,
   *   descuento: number,
   *   descuentoDescripcion: string,
   *   baseImponible: number,
   *   itbis: number,
   *   total: number
   * }}
   */
  calcularTotal(servicios, repuestos) {
    const totalServicios = servicios.reduce((acc, s) => acc + s.calcularTotal(), 0);
    const totalRepuestos = repuestos.reduce((acc, r) => acc + (r.precio * r.cantidad), 0);
    const subtotal       = totalServicios + totalRepuestos;

    const descuento      = this._estrategia.calcular(subtotal);
    const baseImponible  = subtotal - descuento;
    const itbis          = parseFloat((baseImponible * CalculadoraOrden.ITBIS).toFixed(2));
    const total          = parseFloat((baseImponible + itbis).toFixed(2));

    return {
      subtotal:             parseFloat(subtotal.toFixed(2)),
      descuento:            parseFloat(descuento.toFixed(2)),
      descuentoDescripcion: this._estrategia.descripcion(),
      baseImponible:        parseFloat(baseImponible.toFixed(2)),
      itbis,
      total,
    };
  }
}

module.exports = CalculadoraOrden;
