'use strict';

const OrdenId            = require('../shared/valueObjects/OrdenId');
const Prioridad          = require('../shared/valueObjects/Prioridad');
const EstadoRecibida     = require('./estados/EstadoRecibida');
const OrdenCreadaEvent   = require('./events/OrdenCreadaEvent');
const EstadoCambiadoEvent = require('./events/EstadoCambiadoEvent');

/**
 * OrdenServicio — Aggregate Root (DDD Táctico)
 *
 * Entidad central del sistema. Gestiona el ciclo de vida completo
 * de una orden de servicio mecánico mediante el patrón State.
 *
 * Acumula Domain Events (patrón pull) que se publican al guardar.
 *
 * SOLID:
 *  - SRP: única responsabilidad — gestionar el ciclo de vida de la orden
 *  - OCP: nuevos estados se agregan sin modificar esta clase
 *  - DIP: depende de abstracciones (EstadoOrden), no de clases concretas
 */
class OrdenServicio {
  /** @type {OrdenId} */
  #id;
  /** @type {string} */
  #clienteId;
  /** @type {string} */
  #vehiculoId;
  /** @type {string|null} */
  #mecanicoId;
  /** @type {import('./estados/EstadoOrden')} */
  #estado;
  /** @type {Prioridad} */
  #prioridad;
  /** @type {import('../servicio/Servicio')[]} */
  #servicios;
  /** @type {Array<{nombre:string, precio:number, cantidad:number}>} */
  #repuestos;
  /** @type {string} */
  #notas;
  /** @type {Date} */
  #fechaCreacion;
  /** @type {Date|null} */
  #fechaEntregaEstimada;
  /** @type {Date|null} */
  fechaEntregaReal;
  /** @type {import('./events/DomainEvent')[]} */
  #domainEvents;
  /** @type {string|null} - Datos de solo lectura del cliente (asignados por el repositorio) */
  clienteNombre;
  /** @type {string|null} - Datos de solo lectura del vehículo (asignados por el repositorio) */
  vehiculoNombre;
  /** @type {string|null} - Datos de solo lectura del mecánico (asignados por el repositorio) */
  mecanicoNombre;

  /**
   * Constructor privado — usar OrdenServicioBuilder o reconstruir()
   */
  constructor({
    id,
    clienteId,
    vehiculoId,
    mecanicoId = null,
    estado,
    prioridad,
    servicios = [],
    repuestos = [],
    notas = '',
    fechaCreacion = new Date(),
    fechaEntregaEstimada = null,
    fechaEntregaReal = null,
  }) {
    this.#id                  = id instanceof OrdenId ? id : OrdenId.desde(id);
    this.#clienteId           = clienteId;
    this.#vehiculoId          = vehiculoId;
    this.#mecanicoId          = mecanicoId;
    this.#estado              = estado || new EstadoRecibida();
    this.#prioridad           = prioridad instanceof Prioridad
                                  ? prioridad
                                  : Prioridad.desde(prioridad || 'NORMAL');
    this.#servicios           = [...servicios];
    this.#repuestos           = [...repuestos];
    this.#notas               = notas;
    this.#fechaCreacion       = fechaCreacion;
    this.#fechaEntregaEstimada = fechaEntregaEstimada;
    this.fechaEntregaReal     = fechaEntregaReal;
    this.#domainEvents        = [];
  }

  // ─── Factory Methods ──────────────────────────────────────────────────────

  /**
   * Crea una nueva OrdenServicio (primera vez).
   * Emite OrdenCreadaEvent.
   */
  static crear({ id, clienteId, vehiculoId, mecanicoId, prioridad, servicios, repuestos, notas, fechaEntregaEstimada }) {
    const ordenId = id || OrdenId.generar();
    const orden = new OrdenServicio({
      id: ordenId,
      clienteId,
      vehiculoId,
      mecanicoId,
      estado: new EstadoRecibida(),
      prioridad: prioridad || 'NORMAL',
      servicios,
      repuestos,
      notas,
      fechaEntregaEstimada,
    });

    orden.#domainEvents.push(new OrdenCreadaEvent({
      ordenId: ordenId.toString(),
      clienteId,
      vehiculoId,
      prioridad: orden.#prioridad.value,
    }));

    return orden;
  }

  /**
   * Reconstruye una OrdenServicio desde datos persistidos (sin emitir eventos).
   */
  static reconstruir(datos) {
    const estadoMap = {
      RECIBIDA:       () => new (require('./estados/EstadoRecibida'))(),
      EN_DIAGNOSTICO: () => new (require('./estados/EstadoEnDiagnostico'))(),
      PRESUPUESTADA:  () => new (require('./estados/EstadoPresupuestada'))(),
      APROBADA:       () => new (require('./estados/EstadoAprobada'))(),
      EN_REPARACION:  () => new (require('./estados/EstadoEnReparacion'))(),
      LISTA:          () => new (require('./estados/EstadoLista'))(),
      ENTREGADA:      () => new (require('./estados/EstadoEntregada'))(),
      FACTURADA:      () => new (require('./estados/EstadoFacturada'))(),
      RECHAZADA:      () => new (require('./estados/EstadoRechazada'))(),
    };
    if (!estadoMap[datos.estado]) {
      throw new Error(`Estado desconocido para reconstrucción: ${datos.estado}`);
    }
    const estado = estadoMap[datos.estado]();

    return new OrdenServicio({ ...datos, estado });
  }

  // ─── Comportamiento del Aggregate ────────────────────────────────────────

  /**
   * Avanza al siguiente estado del ciclo de vida (delegado al estado actual).
   */
  avanzar() {
    if (this.#estado.esTerminal()) {
      throw new Error(`La orden "${this.#id}" está en estado terminal: ${this.#estado.nombre()}`);
    }
    this.#estado.avanzar(this);
  }

  /**
   * Rechaza la orden (solo posible en estado Presupuestada).
   */
  rechazar() {
    this.#estado.rechazar(this);
  }

  /**
   * Llamado por los estados concretos para efectuar la transición.
   * Emite EstadoCambiadoEvent.
   * @param {import('./estados/EstadoOrden')} nuevoEstado
   * @internal
   */
  _cambiarEstado(nuevoEstado) {
    const estadoAnterior = this.#estado.nombre();
    this.#estado = nuevoEstado;

    this.#domainEvents.push(new EstadoCambiadoEvent({
      ordenId:        this.#id.toString(),
      clienteId:      this.#clienteId,
      estadoAnterior,
      estadoNuevo:    nuevoEstado.nombre(),
      mecanicoId:     this.#mecanicoId,
    }));
  }

  /**
   * Agrega un servicio a la orden.
   * @param {import('../servicio/Servicio')} servicio
   */
  agregarServicio(servicio) {
    if (!servicio) throw new Error('Servicio no puede ser nulo');
    this.#servicios.push(servicio);
  }

  /**
   * Agrega un repuesto a la orden.
   * @param {{nombre:string, precio:number, cantidad:number}} repuesto
   */
  agregarRepuesto(repuesto) {
    if (!repuesto.nombre) throw new Error('El repuesto debe tener nombre');
    if (repuesto.precio < 0) throw new Error('El precio del repuesto no puede ser negativo');
    if (repuesto.cantidad < 1) throw new Error('La cantidad del repuesto debe ser al menos 1');
    this.#repuestos.push({ ...repuesto });
  }

  /**
   * Asigna un mecánico a la orden.
   * @param {string} mecanicoId
   */
  asignarMecanico(mecanicoId) {
    if (!mecanicoId) throw new Error('mecanicoId es requerido');
    this.#mecanicoId = mecanicoId;
  }

  // ─── Domain Events (patrón pull) ──────────────────────────────────────────

  /**
   * Retorna los eventos pendientes y limpia la cola interna.
   * Llamado por el repositorio al guardar.
   * @returns {import('./events/DomainEvent')[]}
   */
  pullEvents() {
    const eventos = [...this.#domainEvents];
    this.#domainEvents = [];
    return eventos;
  }

  // ─── Getters (read-only) ─────────────────────────────────────────────────

  get id()                  { return this.#id; }
  get clienteId()           { return this.#clienteId; }
  get vehiculoId()          { return this.#vehiculoId; }
  get mecanicoId()          { return this.#mecanicoId; }
  get estado()              { return this.#estado.nombre(); }
  get estadoObj()           { return this.#estado; }
  get prioridad()           { return this.#prioridad.value; }
  get servicios()           { return [...this.#servicios]; }
  get repuestos()           { return [...this.#repuestos]; }
  get notas()               { return this.#notas; }
  get fechaCreacion()       { return this.#fechaCreacion; }
  get fechaEntregaEstimada() { return this.#fechaEntregaEstimada; }

  /**
   * Representación plana para persistencia.
   */
  toJSON() {
    return {
      id:                   this.#id.toString(),
      clienteId:            this.#clienteId,
      vehiculoId:           this.#vehiculoId,
      mecanicoId:           this.#mecanicoId,
      estado:               this.#estado.nombre(),
      prioridad:            this.#prioridad.value,
      servicios:            this.#servicios.map(s => s.toJSON ? s.toJSON() : s),
      repuestos:            this.#repuestos,
      notas:                this.#notas,
      fechaCreacion:        this.#fechaCreacion,
      fechaEntregaEstimada: this.#fechaEntregaEstimada,
      fechaEntregaReal:     this.fechaEntregaReal,
      // Datos de solo lectura (agregados por el repositorio para la UI)
      clienteNombre:        this.clienteNombre,
      vehiculoNombre:       this.vehiculoNombre,
      mecanicoNombre:       this.mecanicoNombre,
    };
  }
}

module.exports = OrdenServicio;
