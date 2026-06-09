'use strict';

const OrdenServicioBuilder = require('../../src/domain/orden/OrdenServicioBuilder');
const ServicioFactory      = require('../../src/domain/servicio/ServicioFactory');

describe('OrdenServicioBuilder — Patrón Builder', () => {

  const servicio = ServicioFactory.crear('mantenimiento', { descripcion: 'Aceite', costo: 800 });

  test('Construye una OrdenServicio completa', () => {
    const orden = new OrdenServicioBuilder()
      .conCliente('cli-001')
      .conVehiculo('veh-001')
      .conPrioridad('URGENTE')
      .agregarServicio(servicio)
      .agregarRepuesto({ nombre: 'Filtro', precio: 300, cantidad: 1 })
      .conNotas('Revisar sistema de frenos')
      .construir();

    expect(orden.clienteId).toBe('cli-001');
    expect(orden.vehiculoId).toBe('veh-001');
    expect(orden.prioridad).toBe('URGENTE');
    expect(orden.servicios).toHaveLength(1);
    expect(orden.repuestos).toHaveLength(1);
    expect(orden.notas).toBe('Revisar sistema de frenos');
    expect(orden.estado).toBe('RECIBIDA');
  });

  test('Lanza error si no hay cliente', () => {
    expect(() => new OrdenServicioBuilder()
      .conVehiculo('veh-001')
      .agregarServicio(servicio)
      .construir()
    ).toThrow('clienteId');
  });

  test('Lanza error si no hay vehículo', () => {
    expect(() => new OrdenServicioBuilder()
      .conCliente('cli-001')
      .agregarServicio(servicio)
      .construir()
    ).toThrow('vehiculoId');
  });

  test('Lanza error si no hay servicios', () => {
    expect(() => new OrdenServicioBuilder()
      .conCliente('cli-001')
      .conVehiculo('veh-001')
      .construir()
    ).toThrow('servicio');
  });

  test('Permite fluent chaining', () => {
    const builder = new OrdenServicioBuilder();
    expect(builder.conCliente('x')).toBe(builder);
    expect(builder.conVehiculo('y')).toBe(builder);
    expect(builder.agregarServicio(servicio)).toBe(builder);
  });
});
