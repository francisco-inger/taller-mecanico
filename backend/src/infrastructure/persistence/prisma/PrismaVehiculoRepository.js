'use strict';

const VehiculoRepository = require('../VehiculoRepository');
const prisma = require('./prismaClient');

class PrismaVehiculoRepository extends VehiculoRepository {
  async obtenerPorId(id) {
    return prisma.vehiculo.findUnique({ where: { id }, include: { cliente: true } });
  }

  async listarPorCliente(clienteId) {
    return prisma.vehiculo.findMany({ where: { clienteId }, orderBy: { marca: 'asc' } });
  }

  async crear(datos) {
    return prisma.vehiculo.create({ data: datos });
  }

  async actualizar(id, datos) {
    return prisma.vehiculo.update({ where: { id }, data: datos });
  }
}

module.exports = PrismaVehiculoRepository;
