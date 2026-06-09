'use strict';

const UsuarioRepository = require('../UsuarioRepository');
const prisma = require('./prismaClient');

class PrismaUsuarioRepository extends UsuarioRepository {
  async obtenerPorId(id) {
    return prisma.usuario.findUnique({ where: { id } });
  }

  async obtenerPorEmail(email) {
    return prisma.usuario.findUnique({ where: { email } });
  }

  async crear(datos) {
    return prisma.usuario.create({ data: datos });
  }

  async actualizar(id, datos) {
    return prisma.usuario.update({ where: { id }, data: datos });
  }

  async listar() {
    return prisma.usuario.findMany({ 
      orderBy: { nombre: 'asc' },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        creadoEn: true,
      }
    });
  }
}

module.exports = PrismaUsuarioRepository;
