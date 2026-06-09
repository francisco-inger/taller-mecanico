'use strict';

const OrdenServicioBuilder         = require('../../domain/orden/OrdenServicioBuilder');
const ServicioFactory              = require('../../domain/servicio/ServicioFactory');
const SinDescuento                 = require('../../domain/presupuesto/estrategias/SinDescuento');
const DescuentoClienteFrecuente    = require('../../domain/presupuesto/estrategias/DescuentoClienteFrecuente');

/**
 * CrearOrdenUseCase — Caso de Uso
 *
 * Orquesta la creación de una nueva OrdenServicio:
 * 1. Valida que cliente y vehículo existan
 * 2. Usa el Builder para construir la orden
 * 3. Guarda en el repositorio
 * 4. Publica los Domain Events generados
 *
 * SOLID: SRP — única responsabilidad: crear una orden
 */
class CrearOrdenUseCase {
  /**
   * @param {import('../../infrastructure/persistence/OrdenRepository')} ordenRepo
   * @param {import('../../infrastructure/persistence/ClienteRepository')} clienteRepo
   * @param {import('../../infrastructure/persistence/VehiculoRepository')} vehiculoRepo
   * @param {import('../EventBus')} eventBus
   */
  constructor(ordenRepo, clienteRepo, vehiculoRepo, eventBus) {
    this._ordenRepo   = ordenRepo;
    this._clienteRepo = clienteRepo;
    this._vehiculoRepo = vehiculoRepo;
    this._eventBus    = eventBus;
  }

  /**
   * @param {object} cmd
   * @param {string} cmd.clienteId
   * @param {string} cmd.vehiculoId
   * @param {string} [cmd.mecanicoId]
   * @param {'NORMAL'|'URGENTE'|'VIP'} [cmd.prioridad]
   * @param {Array<{tipo:string,descripcion:string,costo:number,tiempoEstimado:number}>} cmd.servicios
   * @param {Array<{nombre:string,precio:number,cantidad:number}>} [cmd.repuestos]
   * @param {string} [cmd.notas]
   * @param {string} [cmd.fechaEntregaEstimada]
   * @returns {Promise<object>}
   */
  async ejecutar(cmd) {
    // Verificar existencia de cliente y vehículo
    const cliente  = await this._clienteRepo.obtenerPorId(cmd.clienteId);
    if (!cliente) throw new Error(`Cliente con id "${cmd.clienteId}" no encontrado`);

    const vehiculo = await this._vehiculoRepo.obtenerPorId(cmd.vehiculoId);
    if (!vehiculo) throw new Error(`Vehículo con id "${cmd.vehiculoId}" no encontrado`);

    // Construir servicios usando la Factory
    const servicios = (cmd.servicios || []).map(s =>
      ServicioFactory.crear(s.tipo, {
        descripcion:    s.descripcion,
        costo:          s.costo,
        tiempoEstimado: s.tiempoEstimado || 0,
      })
    );

    // Builder construye la orden
    const builder = new OrdenServicioBuilder()
      .conCliente(cmd.clienteId)
      .conVehiculo(cmd.vehiculoId)
      .conPrioridad(cmd.prioridad || 'NORMAL')
      .conNotas(cmd.notas || '');

    if (cmd.mecanicoId) builder.asignarMecanico(cmd.mecanicoId);
    if (cmd.fechaEntregaEstimada) builder.conEntregaEstimada(cmd.fechaEntregaEstimada);

    servicios.forEach(s => builder.agregarServicio(s));
    (cmd.repuestos || []).forEach(r => builder.agregarRepuesto(r));

    const orden = builder.construir();

    // Guardar y publicar eventos
    await this._ordenRepo.guardar(orden);
    const eventos = orden.pullEvents();
    await this._eventBus.publicarTodos(eventos);

    return orden.toJSON();
  }
}

module.exports = CrearOrdenUseCase;
