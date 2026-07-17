'use strict';

const SolicitudArcoRepository = require('../SolicitudArcoRepository');
const prisma = require('./prismaClient');

class PrismaSolicitudArcoRepository extends SolicitudArcoRepository {
  async crear(datos) {
    return prisma.solicitudArco.create({
      data: {
        clienteId: datos.clienteId,
        tipo: datos.tipo,
        descripcion: datos.descripcion,
        estado: datos.estado || 'PENDIENTE'
      },
      include: {
        cliente: true
      }
    });
  }

  async actualizarEstado(id, estado, respuesta) {
    return prisma.solicitudArco.update({
      where: { id },
      data: {
        estado,
        respuesta
      },
      include: {
        cliente: true
      }
    });
  }

  async obtenerPorId(id) {
    return prisma.solicitudArco.findUnique({
      where: { id },
      include: {
        cliente: true
      }
    });
  }

  async listar() {
    return prisma.solicitudArco.findMany({
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: true
      }
    });
  }

  async listarPorCliente(clienteId) {
    return prisma.solicitudArco.findMany({
      where: { clienteId },
      orderBy: { creadoEn: 'desc' },
      include: {
        cliente: true
      }
    });
  }
}

module.exports = PrismaSolicitudArcoRepository;
