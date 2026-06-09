'use strict';

const ServicioFactory = require('../../src/domain/servicio/ServicioFactory');

describe('ServicioFactory — Patrón Factory Method', () => {

  test('Crea ServicioMantenimiento correctamente', () => {
    const s = ServicioFactory.crear('mantenimiento', { descripcion: 'Cambio aceite', costo: 800, tiempoEstimado: 30 });
    expect(s.tipo()).toBe('mantenimiento');
    expect(s.calcularTotal()).toBe(800); // precio fijo
  });

  test('Crea ServicioReparacion: costo + tarifa hora', () => {
    // 120 min = 2 horas * RD$ 500 = 1000
    const s = ServicioFactory.crear('reparacion', { descripcion: 'Frenos', costo: 500, tiempoEstimado: 120 });
    expect(s.tipo()).toBe('reparacion');
    expect(s.calcularTotal()).toBe(1500); // 500 + (120/60)*500
  });

  test('Crea ServicioDiagnostico: costo + RD$ 200 fijo', () => {
    const s = ServicioFactory.crear('diagnostico', { descripcion: 'Scanner OBD2', costo: 300, tiempoEstimado: 45 });
    expect(s.tipo()).toBe('diagnostico');
    expect(s.calcularTotal()).toBe(500); // 300 + 200
  });

  test('Tipo desconocido lanza error', () => {
    expect(() => ServicioFactory.crear('vuelo', { descripcion: 'test', costo: 0 })).toThrow();
  });

  test('toJSON incluye tipo, descripcion y total', () => {
    const s = ServicioFactory.crear('mantenimiento', { descripcion: 'Aceite', costo: 600 });
    const json = s.toJSON();
    expect(json.tipo).toBe('mantenimiento');
    expect(json.total).toBe(600);
  });
});
