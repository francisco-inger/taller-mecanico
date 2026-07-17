'use strict';

const FirmaDigitalRepository = require('../FirmaDigitalRepository');
const prisma = require('./prismaClient');

class PrismaFirmaDigitalRepository extends FirmaDigitalRepository {
  async guardar(datos) {
    return prisma.firmaDigital.create({
      data: {
        entidad: datos.entidad,
        entidadId: datos.entidadId,
        firmante: datos.firmante,
        imagenBase64: datos.imagenBase64,
        usuarioId: datos.usuarioId
      },
      include: {
        usuario: true
      }
    });
  }

  async obtenerPorId(id) {
    return prisma.firmaDigital.findUnique({
      where: { id },
      include: {
        usuario: true
      }
    });
  }

  async obtenerPorEntidad(entidad, entidadId) {
    return prisma.firmaDigital.findMany({
      where: {
        entidad,
        entidadId
      },
      orderBy: { creadoEn: 'desc' },
      include: {
        usuario: true
      }
    });
  }

  async listar() {
    return prisma.firmaDigital.findMany({
      orderBy: { creadoEn: 'desc' },
      include: {
        usuario: true
      }
    });
  }
}

module.exports = PrismaFirmaDigitalRepository;
