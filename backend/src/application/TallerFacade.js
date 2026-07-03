'use strict';

const CrearOrdenUseCase          = require('./casos-de-uso/CrearOrdenUseCase');
const AvanzarEstadoUseCase       = require('./casos-de-uso/AvanzarEstadoUseCase');
const GenerarPresupuestoUseCase  = require('./casos-de-uso/GenerarPresupuestoUseCase');
const AprobarPresupuestoUseCase  = require('./casos-de-uso/AprobarPresupuestoUseCase');
const RechazarPresupuestoUseCase = require('./casos-de-uso/RechazarPresupuestoUseCase');
const GenerarFacturaUseCase      = require('./casos-de-uso/GenerarFacturaUseCase');
const ActualizarFacturaUseCase   = require('./casos-de-uso/ActualizarFacturaUseCase');
const ListarOrdenesUseCase       = require('./casos-de-uso/ListarOrdenesUseCase');
const CrearClienteUseCase        = require('./casos-de-uso/CrearClienteUseCase');
const CrearVehiculoUseCase       = require('./casos-de-uso/CrearVehiculoUseCase');
const ActualizarClienteUseCase   = require('./casos-de-uso/ActualizarClienteUseCase');
const CrearUsuarioUseCase        = require('./casos-de-uso/CrearUsuarioUseCase');
const ActualizarUsuarioUseCase   = require('./casos-de-uso/ActualizarUsuarioUseCase');
const LoginUseCase               = require('./casos-de-uso/LoginUseCase');

/**
 * TallerFacade — Patrón Facade
 *
 * Punto de entrada unificado para todas las operaciones del módulo de taller.
 * Simplifica la interfaz del subsistema complejo (todos los casos de uso).
 * Los controladores HTTP solo interactúan con este facade.
 *
 * SOLID:
 *  - SRP: delega cada operación al caso de uso correspondiente
 *  - DIP: recibe repositorios por inyección de dependencias
 *  - ISP: los clientes solo usan los métodos que necesitan
 *
 * @example
 * const facade = new TallerFacade({ ordenRepo, clienteRepo, vehiculoRepo,
 *                                   facturaRepo, usuarioRepo, eventBus, jwtAdapter });
 * const orden = await facade.crearOrden({ clienteId, vehiculoId, servicios });
 */
class TallerFacade {
  /**
   * @param {object} deps - Dependencias inyectadas
   * @param {object} deps.ordenRepo
   * @param {object} deps.clienteRepo
   * @param {object} deps.vehiculoRepo
   * @param {object} deps.facturaRepo
   * @param {object} deps.usuarioRepo
   * @param {object} deps.mecanicoRepo
   * @param {import('./EventBus')} deps.eventBus
   * @param {object} deps.jwtAdapter
   */
  constructor({ ordenRepo, clienteRepo, vehiculoRepo, facturaRepo, usuarioRepo, mecanicoRepo, eventBus, jwtAdapter }) {
    this._crearOrden          = new CrearOrdenUseCase(ordenRepo, clienteRepo, vehiculoRepo, eventBus);
    this._avanzarEstado       = new AvanzarEstadoUseCase(ordenRepo, eventBus);
    this._generarPresupuesto  = new GenerarPresupuestoUseCase(ordenRepo, clienteRepo);
    this._aprobarPresupuesto  = new AprobarPresupuestoUseCase(ordenRepo, eventBus);
    this._rechazarPresupuesto = new RechazarPresupuestoUseCase(ordenRepo, eventBus);
    this._generarFactura      = new GenerarFacturaUseCase(ordenRepo, clienteRepo, facturaRepo, eventBus);
    this._actualizarFactura   = new ActualizarFacturaUseCase(facturaRepo, ordenRepo);
    this._listarOrdenes       = new ListarOrdenesUseCase(ordenRepo);
    this._crearCliente        = new CrearClienteUseCase(clienteRepo);
    this._actualizarCliente   = new ActualizarClienteUseCase(clienteRepo);
    this._crearUsuario        = new CrearUsuarioUseCase(usuarioRepo);
    this._actualizarUsuario   = new ActualizarUsuarioUseCase(usuarioRepo);
    this._login               = new LoginUseCase(usuarioRepo, jwtAdapter);
    this._crearVehiculo       = new CrearVehiculoUseCase(vehiculoRepo);

    // Guardar repos para operaciones directas
    this._ordenRepo    = ordenRepo;
    this._clienteRepo  = clienteRepo;
    this._vehiculoRepo = vehiculoRepo;
    this._facturaRepo  = facturaRepo;
    this._usuarioRepo  = usuarioRepo;
    this._mecanicoRepo = mecanicoRepo;
  }

  // ─── Órdenes ─────────────────────────────────────────────────────────────

  crearOrden(cmd) {
    return this._crearOrden.ejecutar(cmd);
  }

  obtenerOrden(id) {
    return this._ordenRepo.obtenerPorId(id);
  }

  listarOrdenes(filtros) {
    return this._listarOrdenes.ejecutar(filtros);
  }

  avanzarEstado(ordenId) {
    return this._avanzarEstado.ejecutar(ordenId);
  }

  eliminarOrden(id) {
    return this._ordenRepo.eliminar(id);
  }

  generarPresupuesto(ordenId) {
    return this._generarPresupuesto.ejecutar(ordenId);
  }

  aprobarPresupuesto(ordenId) {
    return this._aprobarPresupuesto.ejecutar(ordenId);
  }

  rechazarPresupuesto(ordenId) {
    return this._rechazarPresupuesto.ejecutar(ordenId);
  }

  // ─── Facturación ──────────────────────────────────────────────────────────

  generarFactura(ordenId, descuento, descripDescuento) {
    return this._generarFactura.ejecutar(ordenId, descuento, descripDescuento);
  }

  obtenerFactura(id) {
    return this._facturaRepo.obtenerPorId(id);
  }

  listarFacturas() {
    return this._facturaRepo.listar();
  }

  actualizarFactura(id, datos) {
    return this._actualizarFactura.ejecutar(id, datos);
  }

  eliminarFactura(id) {
    return this._facturaRepo.eliminar(id);
  }

  // ─── Clientes ─────────────────────────────────────────────────────────────

  crearCliente(datos) {
    return this._crearCliente.ejecutar(datos);
  }

  actualizarCliente(id, datos) {
    return this._actualizarCliente.ejecutar(id, datos);
  }

  // --- Usuarios ---
  crearUsuario(datos) {
    return this._crearUsuario.ejecutar(datos);
  }

  actualizarUsuario(id, datos) {
    return this._actualizarUsuario.ejecutar(id, datos);
  }

  listarUsuarios() {
    return this._usuarioRepo.listar();
  }

  listarClientes() {
    return this._clienteRepo.listar();
  }

  obtenerCliente(id) {
    return this._clienteRepo.obtenerPorId(id);
  }

  // ─── Vehículos ────────────────────────────────────────────────────────────

  crearVehiculo(datos) {
    return this._crearVehiculo.ejecutar(datos);
  }

  listarVehiculos(clienteId) {
    return this._vehiculoRepo.listarPorCliente(clienteId);
  }

  obtenerVehiculo(id) {
    return this._vehiculoRepo.obtenerPorId(id);
  }

  // ─── Mecánicos ────────────────────────────────────────────────────────────

  crearMecanico(datos) {
    return this._mecanicoRepo.crear(datos);
  }

  actualizarMecanico(id, datos) {
    return this._mecanicoRepo.actualizar(id, datos);
  }

  listarMecanicos() {
    return this._mecanicoRepo.listar();
  }

  obtenerEstadisticasMecanicos() {
    return this._mecanicoRepo.obtenerEstadisticasOcupacion();
  }

  // ─── Autenticación ────────────────────────────────────────────────────────

  login(email, password) {
    return this._login.ejecutar(email, password);
  }
}

module.exports = TallerFacade;
