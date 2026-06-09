'use strict';

const CalculadoraOrden          = require('../../src/domain/presupuesto/CalculadoraOrden');
const SinDescuento              = require('../../src/domain/presupuesto/estrategias/SinDescuento');
const DescuentoClienteFrecuente = require('../../src/domain/presupuesto/estrategias/DescuentoClienteFrecuente');
const DescuentoCorporativo      = require('../../src/domain/presupuesto/estrategias/DescuentoCorporativo');
const DescuentoPromocion        = require('../../src/domain/presupuesto/estrategias/DescuentoPromocion');
const ServicioFactory           = require('../../src/domain/servicio/ServicioFactory');

describe('CalculadoraOrden — Patrón Strategy + ITBIS 18%', () => {
  const servicios = [
    ServicioFactory.crear('mantenimiento', { descripcion: 'Cambio aceite', costo: 1000, tiempoEstimado: 30 }),
  ];
  const repuestos = [
    { nombre: 'Filtro', precio: 500, cantidad: 1 }
  ];
  // Subtotal = 1000 + 500 = 1500

  test('Sin descuento: total = subtotal + ITBIS 18%', () => {
    const calc = new CalculadoraOrden(new SinDescuento());
    const r = calc.calcularTotal(servicios, repuestos);
    expect(r.subtotal).toBe(1500);
    expect(r.descuento).toBe(0);
    expect(r.itbis).toBeCloseTo(270); // 1500 * 0.18
    expect(r.total).toBeCloseTo(1770);
  });

  test('Descuento cliente frecuente (10%): descuento = 150', () => {
    const calc = new CalculadoraOrden(new DescuentoClienteFrecuente());
    const r = calc.calcularTotal(servicios, repuestos);
    expect(r.descuento).toBeCloseTo(150);
    expect(r.baseImponible).toBeCloseTo(1350);
    expect(r.itbis).toBeCloseTo(243);      // 1350 * 0.18
    expect(r.total).toBeCloseTo(1593);
  });

  test('Descuento corporativo (20%)', () => {
    const calc = new CalculadoraOrden(new DescuentoCorporativo(20));
    const r = calc.calcularTotal(servicios, repuestos);
    expect(r.descuento).toBeCloseTo(300);
  });

  test('Descuento promoción RD$ 200 fijo', () => {
    const calc = new CalculadoraOrden(new DescuentoPromocion(200));
    const r = calc.calcularTotal(servicios, repuestos);
    expect(r.descuento).toBe(200);
  });

  test('Promoción no excede el subtotal', () => {
    const calc = new CalculadoraOrden(new DescuentoPromocion(9999));
    const r = calc.calcularTotal(servicios, repuestos);
    expect(r.descuento).toBe(1500); // máximo = subtotal
  });

  test('setEstrategia cambia en tiempo de ejecución', () => {
    const calc = new CalculadoraOrden();
    calc.setEstrategia(new DescuentoClienteFrecuente());
    const r = calc.calcularTotal(servicios, repuestos);
    expect(r.descuento).toBeGreaterThan(0);
  });

  test('DescuentoCorporativo porcentaje inválido lanza error', () => {
    expect(() => new DescuentoCorporativo(101)).toThrow();
    expect(() => new DescuentoCorporativo(-1)).toThrow();
  });
});
