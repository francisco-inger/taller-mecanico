'use strict';

const OrdenRepository = require('../OrdenRepository');
const OrdenServicio   = require('../../../domain/orden/OrdenServicio');
const ServicioFactory = require('../../../domain/servicio/ServicioFactory');
const prisma          = require('./prismaClient');

/**
 * PrismaOrdenRepository — Implementación PostgreSQL (Patrón Repository)
 *
 * Implementa OrdenRepository usando Prisma ORM.
 * Convierte entre el modelo de dominio y el modelo de persistencia.
 *
 * SOLID: DIP — implementa la abstracción OrdenRepository
 */
class PrismaOrdenRepository extends OrdenRepository {

  async obtenerPorId(id) {
    const registro = await prisma.orden.findUnique({
      where: { id: id.toString ? id.toString() : id },
      include: {
        servicios: true,
        repuestos: true,
        cliente:  { select: { nombre: true, telefono: true, email: true } },
        vehiculo: { select: { marca: true, modelo: true, placa: true, anio: true } },
        mecanico: { select: { nombre: true } },
      },
    });
    if (!registro) return null;
    return this._mapearADominio(registro);
  }

  async guardar(orden) {
    const datos = orden.toJSON();

    await prisma.$transaction(async (tx) => {
      // Upsert de la orden
      await tx.orden.upsert({
        where:  { id: datos.id },
        create: {
          id:                   datos.id,
          clienteId:            datos.clienteId,
          vehiculoId:           datos.vehiculoId,
          mecanicoId:           datos.mecanicoId,
          estado:               datos.estado,
          prioridad:            datos.prioridad,
          notas:                datos.notas,
          fechaEntregaEstimada: datos.fechaEntregaEstimada,
          fechaEntregaReal:     datos.fechaEntregaReal,
        },
        update: {
          mecanicoId:       datos.mecanicoId,
          estado:           datos.estado,
          prioridad:        datos.prioridad,
          notas:            datos.notas,
          fechaEntregaReal: datos.fechaEntregaReal,
        },
      });

      // Reemplazar servicios
      await tx.ordenServicio.deleteMany({ where: { ordenId: datos.id } });
      if (datos.servicios.length > 0) {
        await tx.ordenServicio.createMany({
          data: datos.servicios.map(s => ({
            ordenId:        datos.id,
            tipo:           s.tipo,
            descripcion:    s.descripcion,
            costo:          s.costo,
            tiempoEstimado: s.tiempoEstimado,
          })),
        });
      }

      // Reemplazar repuestos
      await tx.ordenRepuesto.deleteMany({ where: { ordenId: datos.id } });
      if (datos.repuestos.length > 0) {
        await tx.ordenRepuesto.createMany({
          data: datos.repuestos.map(r => ({
            ordenId:  datos.id,
            nombre:   r.nombre,
            precio:   r.precio,
            cantidad: r.cantidad,
          })),
        });
      }
    });
  }

  async listar(filtros = {}) {
    const where = {};
    if (filtros.estado)     where.estado      = filtros.estado;
    if (filtros.mecanicoId) where.mecanicoId  = filtros.mecanicoId;
    if (filtros.clienteId)  where.clienteId   = filtros.clienteId;

    const registros = await prisma.orden.findMany({
      where,
      include: {
        servicios: true,
        repuestos: true,
        cliente:   { select: { nombre: true } },
        vehiculo:  { select: { marca: true, modelo: true } },
        mecanico:  { select: { nombre: true } },
      },
      orderBy: { fechaCreacion: 'desc' },
    });

    return registros.map(r => this._mapearADominio(r));
  }

  async eliminar(id) {
    // Asegurar que el id sea un string primitivo
    const ordenId = (id && id.value) ? id.value : String(id);
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Eliminar factura asociada (restricción de FK)
        await tx.factura.deleteMany({ where: { ordenId } });
        // 2. Eliminar servicios de la orden
        await tx.ordenServicio.deleteMany({ where: { ordenId } });
        // 3. Eliminar repuestos de la orden
        await tx.ordenRepuesto.deleteMany({ where: { ordenId } });
        // 4. Eliminar la orden principal
        await tx.orden.delete({ where: { id: ordenId } });
      });
    } catch (err) {
      // Enriquecer el error con el contexto de la operación
      const mensaje = `Error al eliminar la orden "${ordenId}": ${err.message}`;
      const error = new Error(mensaje);
      error.statusCode = 500;
      throw error;
    }
  }

  /**
   * Convierte un registro de BD en un Aggregate OrdenServicio.
   * @private
   */
  _mapearADominio(registro) {
    const servicios = (registro.servicios || []).map(s =>
      ServicioFactory.crear(s.tipo, {
        descripcion:    s.descripcion,
        costo:          parseFloat(s.costo),
        tiempoEstimado: s.tiempoEstimado,
      })
    );

    const repuestos = (registro.repuestos || []).map(r => ({
      nombre:   r.nombre,
      precio:   parseFloat(r.precio),
      cantidad: r.cantidad,
    }));

    const orden = OrdenServicio.reconstruir({
      id:                   registro.id,
      clienteId:            registro.clienteId,
      vehiculoId:           registro.vehiculoId,
      mecanicoId:           registro.mecanicoId,
      estado:               registro.estado,
      prioridad:            registro.prioridad,
      servicios,
      repuestos,
      notas:                registro.notas,
      fechaCreacion:        registro.fechaCreacion,
      fechaEntregaEstimada: registro.fechaEntregaEstimada,
      fechaEntregaReal:     registro.fechaEntregaReal,
    });

    // "Augmentar" el aggregate con datos de solo lectura para la UI (opcional)
    if (registro.cliente)  orden.clienteNombre  = registro.cliente.nombre;
    if (registro.vehiculo) orden.vehiculoNombre = `${registro.vehiculo.marca} ${registro.vehiculo.modelo}`;
    if (registro.mecanico) orden.mecanicoNombre  = registro.mecanico.nombre;

    return orden;
  }
}

module.exports = PrismaOrdenRepository;
