'use strict';
const ClienteRepository = require('../ClienteRepository');
const prisma = require('./prismaClient');
class PrismaClienteRepository extends ClienteRepository {
  async obtenerPorId(id) {
    return prisma.cliente.findUnique({ where: { id } });
  }
  async obtenerPorCedula(cedula) {
    return prisma.cliente.findUnique({ where: { cedula } });
  }
  async crear(datos) {
    const { vehiculo, ...datosCliente } = datos
    return prisma.cliente.create({ data: datosCliente });
  }
  async actualizar(id, datos) {
    const { vehiculo, ...datosCliente } = datos
    return prisma.cliente.update({ where: { id }, data: datosCliente });
  }
  async listar() {
    return prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });
  }
}
module.exports = PrismaClienteRepository;