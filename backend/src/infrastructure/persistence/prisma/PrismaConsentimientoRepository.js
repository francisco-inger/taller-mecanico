'use strict';

const ConsentimientoRepository = require('../ConsentimientoRepository');
const prisma = require('./prismaClient');

class PrismaConsentimientoRepository extends ConsentimientoRepository {
  async crear(datos) {
    return prisma.consentimiento.create({
      data: {
        clienteId: datos.clienteId,
        tipo: datos.tipo,
        otorgado: datos.otorgado,
        observacion: datos.observacion
      },
      include: {
        cliente: true
      }
    });
  }

  async actualizar(id, datos) {
    return prisma.consentimiento.update({
      where: { id },
      data: {
        otorgado: datos.otorgado,
        observacion: datos.observacion
      },
      include: {
        cliente: true
      }
    });
  }

  async obtenerPorId(id) {
    return prisma.consentimiento.findUnique({
      where: { id },
      include: {
        cliente: true
      }
    });
  }

  async listarPorCliente(clienteId) {
    return prisma.consentimiento.findMany({
      where: { clienteId },
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: true
      }
    });
  }

  async listarTodos() {
    return prisma.consentimiento.findMany({
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: true
      }
    });
  }
}

module.exports = PrismaConsentimientoRepository;
