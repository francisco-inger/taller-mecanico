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
    return prisma.cliente.create({ data: datos });
  }

  async actualizar(id, datos) {
    return prisma.cliente.update({ where: { id }, data: datos });
  }

  async listar() {
    return prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });
  }
}

module.exports = PrismaClienteRepository;
