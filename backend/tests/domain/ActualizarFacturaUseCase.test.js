'use strict';

const ActualizarFacturaUseCase = require('../../src/application/casos-de-uso/ActualizarFacturaUseCase');

describe('ActualizarFacturaUseCase', () => {
  let mockFacturaRepo;
  let mockOrdenRepo;
  let useCase;

  beforeEach(() => {
    mockFacturaRepo = {
      obtenerPorId: jest.fn(),
      actualizar: jest.fn(),
    };
    mockOrdenRepo = {
      obtenerPorId: jest.fn(),
    };
    useCase = new ActualizarFacturaUseCase(mockFacturaRepo, mockOrdenRepo);
  });

  test('Debe actualizar el descuento y recalcular ITBIS y Total correctamente', async () => {
    const facturaExistente = {
      id: 'fac-1',
      ordenId: 'os-1',
      subtotal: 1000,
      descuento: 0,
      itbis: 180,
      total: 1180,
      descripDescuento: '',
    };

    const ordenAsociada = {
      id: 'os-1',
      servicios: [
        { costo: 800, calcularTotal: () => 800 }
      ],
      repuestos: [
        { precio: 200, cantidad: 1 }
      ],
    };

    mockFacturaRepo.obtenerPorId.mockResolvedValue(facturaExistente);
    mockOrdenRepo.obtenerPorId.mockResolvedValue(ordenAsociada);
    mockFacturaRepo.actualizar.mockImplementation((id, datos) => Promise.resolve({ id, ...datos }));

    const resultado = await useCase.ejecutar('fac-1', {
      descuento: 200,
      descripDescuento: 'Descuento especial por cliente leal',
    });

    expect(mockFacturaRepo.obtenerPorId).toHaveBeenCalledWith('fac-1');
    expect(mockOrdenRepo.obtenerPorId).toHaveBeenCalledWith('os-1');
    
    // Subtotal = 800 + 200 = 1000
    // Descuento = 200
    // Base Imponible = 1000 - 200 = 800
    // ITBIS = 800 * 0.18 = 144
    // Total = 800 + 144 = 944
    expect(resultado.subtotal).toBe(1000);
    expect(resultado.descuento).toBe(200);
    expect(resultado.itbis).toBe(144);
    expect(resultado.total).toBe(944);
    expect(resultado.descripDescuento).toBe('Descuento especial por cliente leal');
  });

  test('Lanza error si la factura no existe', async () => {
    mockFacturaRepo.obtenerPorId.mockResolvedValue(null);

    await expect(useCase.ejecutar('fac-invalida', { descuento: 100 }))
      .rejects.toThrow('Factura "fac-invalida" no encontrada');
  });
});
