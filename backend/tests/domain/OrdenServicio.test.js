'use strict';

const OrdenServicio = require('../../src/domain/orden/OrdenServicio');
const ServicioFactory = require('../../src/domain/servicio/ServicioFactory');

/**
 * Tests del Aggregate Root OrdenServicio
 * Valida el ciclo de vida completo mediante el patrón State
 */
describe('OrdenServicio — Aggregate Root (Patrón State)', () => {

  const crearOrdenBase = () => {
    const servicio = ServicioFactory.crear('mantenimiento', {
      descripcion: 'Cambio de aceite', costo: 800, tiempoEstimado: 30
    });
    return OrdenServicio.crear({
      clienteId:  'cliente-001',
      vehiculoId: 'vehiculo-001',
      prioridad:  'NORMAL',
      servicios:  [servicio],
      repuestos:  [],
      notas:      'Test',
    });
  };

  test('Se crea en estado RECIBIDA', () => {
    const orden = crearOrdenBase();
    expect(orden.estado).toBe('RECIBIDA');
  });

  test('Avanza de RECIBIDA a EN_DIAGNOSTICO', () => {
    const orden = crearOrdenBase();
    orden.avanzar();
    expect(orden.estado).toBe('EN_DIAGNOSTICO');
  });

  test('Ciclo completo: RECIBIDA → ... → FACTURADA', () => {
    const orden = crearOrdenBase();
    orden.avanzar(); // EN_DIAGNOSTICO
    orden.avanzar(); // PRESUPUESTADA
    orden.avanzar(); // APROBADA
    orden.avanzar(); // EN_REPARACION
    orden.avanzar(); // LISTA
    orden.avanzar(); // ENTREGADA
    orden.avanzar(); // FACTURADA
    expect(orden.estado).toBe('FACTURADA');
  });

  test('Estado RECHAZADA desde PRESUPUESTADA', () => {
    const orden = crearOrdenBase();
    orden.avanzar(); // EN_DIAGNOSTICO
    orden.avanzar(); // PRESUPUESTADA
    orden.rechazar();
    expect(orden.estado).toBe('RECHAZADA');
  });

  test('No se puede avanzar desde estado terminal FACTURADA', () => {
    const orden = crearOrdenBase();
    [1, 2, 3, 4, 5, 6, 7].forEach(() => orden.avanzar());
    expect(() => orden.avanzar()).toThrow();
  });

  test('No se puede rechazar desde RECIBIDA', () => {
    const orden = crearOrdenBase();
    expect(() => orden.rechazar()).toThrow();
  });

  test('Emite OrdenCreadaEvent al crear', () => {
    const orden = crearOrdenBase();
    const eventos = orden.pullEvents();
    expect(eventos).toHaveLength(1);
    expect(eventos[0].nombre).toBe('OrdenCreada');
  });

  test('Emite EstadoCambiadoEvent al avanzar', () => {
    const orden = crearOrdenBase();
    orden.pullEvents(); // limpiar eventos de creación
    orden.avanzar();
    const eventos = orden.pullEvents();
    expect(eventos).toHaveLength(1);
    expect(eventos[0].nombre).toBe('EstadoCambiado');
    expect(eventos[0].estadoNuevo).toBe('EN_DIAGNOSTICO');
  });

  test('pullEvents vacía la cola interna', () => {
    const orden = crearOrdenBase();
    orden.pullEvents();
    expect(orden.pullEvents()).toHaveLength(0);
  });

  test('OrdenId tiene formato OS-YYYYMMDD-XXXX', () => {
    const orden = crearOrdenBase();
    expect(orden.id.toString()).toMatch(/^OS-\d{8}-\d{4}$/);
  });

  test('asignarMecanico actualiza el mecanicoId', () => {
    const orden = crearOrdenBase();
    orden.asignarMecanico('mecanico-001');
    expect(orden.mecanicoId).toBe('mecanico-001');
  });

  test('agregarRepuesto funciona correctamente', () => {
    const orden = crearOrdenBase();
    orden.agregarRepuesto({ nombre: 'Filtro', precio: 250, cantidad: 1 });
    expect(orden.repuestos).toHaveLength(1);
    expect(orden.repuestos[0].nombre).toBe('Filtro');
  });
});
