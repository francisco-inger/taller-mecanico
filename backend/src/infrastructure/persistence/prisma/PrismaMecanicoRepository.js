'use strict';

const prisma = require('./prismaClient');

class PrismaMecanicoRepository {
  async obtenerPorId(id) {
    return prisma.mecanico.findUnique({ where: { id } });
  }

  async crear(datos) {
    return prisma.mecanico.create({ data: datos });
  }

  async actualizar(id, datos) {
    return prisma.mecanico.update({ where: { id }, data: datos });
  }

  async listar() {
    return prisma.mecanico.findMany({ 
      where: { activo: true },
      orderBy: { nombre: 'asc' } 
    });
  }

  async obtenerEstadisticasOcupacion() {
    // Calculamos ocupación basada en órdenes en estado EN_REPARACION o EN_DIAGNOSTICO
    const mecanicos = await prisma.mecanico.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: { 
            ordenes: { 
              where: { 
                estado: { in: ['EN_DIAGNOSTICO', 'EN_REPARACION'] } 
              } 
            } 
          }
        }
      }
    });

    return mecanicos.map(m => ({
      id: m.id,
      nombre: m.nombre,
      especialidad: m.especialidad,
      ordenesActivas: m._count.ordenes,
      // Simulamos un porcentaje (ej. 3 órdenes = 100%)
      porcentajeOcupacion: Math.min(Math.round((m._count.ordenes / 3) * 100), 100)
    }));
  }
}

module.exports = PrismaMecanicoRepository;
