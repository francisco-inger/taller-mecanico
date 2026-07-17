'use strict';

const FacturaRepository = require('../FacturaRepository');
const prisma = require('./prismaClient');

class PrismaFacturaRepository extends FacturaRepository {
  async crear(datos) {
    return prisma.factura.create({
      data: datos,
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            servicios: true,
            repuestos: true
          }
        }
      }
    });
  }

  async obtenerPorId(id) {
    return prisma.factura.findUnique({ where: { id }, include: { orden: true } });
  }

  async obtenerPorOrden(ordenId) {
    return prisma.factura.findUnique({ where: { ordenId }, include: { orden: true } });
  }

  async listar() {
    return prisma.factura.findMany({
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            servicios: true,
            repuestos: true
          }
        }
      },
      orderBy: { fechaEmision: 'desc' }
    });
  }

  async actualizar(id, datos) {
    return prisma.factura.update({
      where: { id },
      data: datos,
      include: {
        orden: {
          include: {
            cliente: true,
            vehiculo: true,
            servicios: true,
            repuestos: true
          }
        }
      }
    });
  }

  async eliminar(id) {
    return prisma.factura.delete({ where: { id } });
  }
}

module.exports = PrismaFacturaRepository;
