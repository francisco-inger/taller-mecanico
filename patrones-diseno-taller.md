# Patrones de Diseño — Sistema de Órdenes de Servicio para Taller Mecánico

**Proyecto:** Gestión de Órdenes de Servicio  
**Tipo de Aplicación:** Web / Desktop (React + Node.js)  
**Fecha:** Junio 2026  
**Versión:** 1.0

---

## 1. Visión General del Sistema

El sistema gestiona el ciclo completo de una orden de servicio mecánico: desde la recepción del vehículo hasta la entrega al cliente, pasando por diagnóstico, presupuesto, reparación y facturación.

### Entidades Principales

| Entidad | Descripción |
|---|---|
| `OrdenServicio` | Documento central que agrupa todo el trabajo |
| `Cliente` | Persona propietaria del vehículo |
| `Vehiculo` | Auto, moto o camión a reparar |
| `Mecanico` | Técnico asignado a la orden |
| `Servicio` | Trabajo específico (cambio de aceite, frenos, etc.) |
| `Repuesto` | Pieza usada en la reparación |
| `Factura` | Documento de cobro generado al finalizar |

---

## 2. Patrones de Diseño Aplicados

---

### 2.1 State (Estado) — Ciclo de vida de la Orden de Servicio

**Propósito:** Gestionar los cambios de estado de una `OrdenServicio` sin lógica condicional dispersa.

**Problema que resuelve:** Una orden pasa por múltiples estados: `Recibida → En Diagnóstico → Presupuestada → Aprobada → En Reparación → Lista → Entregada → Facturada`. Cada estado tiene comportamientos distintos (qué acciones están permitidas, qué notificaciones se envían).

**Implementación:**

```javascript
// Estados concretos
class EstadoRecibida {
  manejar(orden) { orden.cambiarEstado(new EstadoDiagnostico()); }
  toString() { return 'Recibida'; }
}

class EstadoDiagnostico {
  manejar(orden) { orden.cambiarEstado(new EstadoPresupuestada()); }
  toString() { return 'En Diagnóstico'; }
}

class EstadoAprobada {
  manejar(orden) { orden.cambiarEstado(new EstadoEnReparacion()); }
  toString() { return 'Aprobada'; }
}

class EstadoEntregada {
  manejar(orden) { orden.cambiarEstado(new EstadoFacturada()); }
  toString() { return 'Entregada'; }
}

// Contexto
class OrdenServicio {
  constructor() {
    this.estado = new EstadoRecibida();
  }

  avanzar() {
    this.estado.manejar(this);
  }

  cambiarEstado(nuevoEstado) {
    console.log(`Cambio: ${this.estado} → ${nuevoEstado}`);
    this.estado = nuevoEstado;
  }

  getEstado() {
    return this.estado.toString();
  }
}
```

**Diagrama de estados:**
```
[Recibida] → [En Diagnóstico] → [Presupuestada] → [Aprobada] → [En Reparación] → [Lista] → [Entregada] → [Facturada]
                                       ↓
                                  [Rechazada] ← (cliente no aprueba presupuesto)
```

---

### 2.2 Observer (Observador) — Notificaciones automáticas

**Propósito:** Notificar automáticamente a clientes, mecánicos y administradores cuando cambia el estado de una orden.

**Problema que resuelve:** Al cambiar el estado de una orden, múltiples partes deben ser informadas (SMS al cliente, alerta al mecánico, registro en bitácora) sin acoplar esas acciones al núcleo de la lógica.

**Implementación:**

```javascript
class EventoOrden {
  constructor() {
    this.observadores = [];
  }

  suscribir(observador) {
    this.observadores.push(observador);
  }

  notificar(orden) {
    this.observadores.forEach(obs => obs.actualizar(orden));
  }
}

// Observadores concretos
class NotificadorSMS {
  actualizar(orden) {
    console.log(`SMS → Cliente ${orden.cliente.telefono}: Su vehículo está ${orden.getEstado()}`);
  }
}

class BitacoraAuditoria {
  actualizar(orden) {
    console.log(`LOG [${new Date().toISOString()}] Orden #${orden.id} → ${orden.getEstado()}`);
  }
}

class AlertaMecanico {
  actualizar(orden) {
    console.log(`ALERTA → Mecánico ${orden.mecanico.nombre}: Nueva tarea asignada`);
  }
}

// Uso
const evento = new EventoOrden();
evento.suscribir(new NotificadorSMS());
evento.suscribir(new BitacoraAuditoria());
evento.suscribir(new AlertaMecanico());

// Cuando la orden avanza de estado, notifica automáticamente
orden.avanzar();
evento.notificar(orden);
```

---

### 2.3 Factory Method (Fábrica) — Creación de tipos de servicios

**Propósito:** Crear distintos tipos de servicios mecánicos sin exponer la lógica de instanciación.

**Problema que resuelve:** Existen diferentes categorías de servicios (mantenimiento preventivo, reparación correctiva, diagnóstico electrónico, carrocería) con cálculos de tiempo y costo distintos.

**Implementación:**

```javascript
// Clase base
class Servicio {
  constructor(descripcion, costo, tiempoEstimado) {
    this.descripcion = descripcion;
    this.costo = costo;
    this.tiempoEstimado = tiempoEstimado; // en minutos
  }

  calcularTotal() {
    return this.costo;
  }
}

// Servicios concretos
class ServicioMantenimiento extends Servicio {
  calcularTotal() {
    return this.costo * 1.0; // precio fijo
  }
}

class ServicioReparacion extends Servicio {
  calcularTotal() {
    return this.costo + (this.tiempoEstimado / 60) * 500; // base + hora técnico
  }
}

class ServicioDiagnosticoElectronico extends Servicio {
  calcularTotal() {
    return this.costo + 200; // tarifa diagnóstico fijo
  }
}

// Fábrica
class ServicioFactory {
  static crear(tipo, descripcion, costo, tiempo) {
    switch (tipo) {
      case 'mantenimiento':
        return new ServicioMantenimiento(descripcion, costo, tiempo);
      case 'reparacion':
        return new ServicioReparacion(descripcion, costo, tiempo);
      case 'diagnostico':
        return new ServicioDiagnosticoElectronico(descripcion, costo, tiempo);
      default:
        throw new Error(`Tipo de servicio desconocido: ${tipo}`);
    }
  }
}

// Uso
const cambioAceite = ServicioFactory.crear('mantenimiento', 'Cambio de aceite 5W-30', 800, 30);
const reparacionFreno = ServicioFactory.crear('reparacion', 'Reparación sistema de frenos', 1500, 120);
```

---

### 2.4 Repository (Repositorio) — Acceso a datos

**Propósito:** Abstraer el acceso a la base de datos para que la lógica de negocio no dependa de la tecnología de persistencia.

**Problema que resuelve:** Permite cambiar de PostgreSQL a MySQL, o de SQL a una API, sin modificar la lógica del negocio.

**Implementación:**

```javascript
// Interfaz (contrato)
class OrdenRepository {
  async obtenerPorId(id) { throw new Error('No implementado'); }
  async guardar(orden) { throw new Error('No implementado'); }
  async listarPorEstado(estado) { throw new Error('No implementado'); }
  async listarPorMecanico(mecanicoId) { throw new Error('No implementado'); }
}

// Implementación PostgreSQL
class OrdenRepositoryPG extends OrdenRepository {
  constructor(db) {
    super();
    this.db = db;
  }

  async obtenerPorId(id) {
    const result = await this.db.query('SELECT * FROM ordenes WHERE id = $1', [id]);
    return result.rows[0];
  }

  async guardar(orden) {
    const { id, clienteId, vehiculoId, estado, fechaCreacion } = orden;
    await this.db.query(
      'INSERT INTO ordenes (id, cliente_id, vehiculo_id, estado, fecha_creacion) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO UPDATE SET estado=$4',
      [id, clienteId, vehiculoId, estado, fechaCreacion]
    );
  }

  async listarPorEstado(estado) {
    const result = await this.db.query(
      'SELECT * FROM ordenes WHERE estado = $1 ORDER BY fecha_creacion DESC',
      [estado]
    );
    return result.rows;
  }
}

// Implementación en memoria (para tests)
class OrdenRepositoryMemoria extends OrdenRepository {
  constructor() {
    super();
    this.ordenes = new Map();
  }

  async obtenerPorId(id) {
    return this.ordenes.get(id);
  }

  async guardar(orden) {
    this.ordenes.set(orden.id, orden);
  }

  async listarPorEstado(estado) {
    return [...this.ordenes.values()].filter(o => o.estado === estado);
  }
}
```

---

### 2.5 Strategy (Estrategia) — Cálculo de descuentos y precios

**Propósito:** Permitir distintos algoritmos de cálculo de precio/descuento intercambiables en tiempo de ejecución.

**Problema que resuelve:** Los precios pueden variar según cliente frecuente, convenio corporativo, promoción especial, etc.

**Implementación:**

```javascript
// Estrategias de descuento
class SinDescuento {
  calcular(subtotal) { return 0; }
  descripcion() { return 'Sin descuento'; }
}

class DescuentoClienteFrecuente {
  calcular(subtotal) { return subtotal * 0.10; }
  descripcion() { return 'Descuento cliente frecuente (10%)'; }
}

class DescuentoCorporativo {
  constructor(porcentaje) { this.porcentaje = porcentaje; }
  calcular(subtotal) { return subtotal * (this.porcentaje / 100); }
  descripcion() { return `Descuento corporativo (${this.porcentaje}%)`; }
}

class DescuentoPromocion {
  constructor(montoFijo) { this.montoFijo = montoFijo; }
  calcular(subtotal) { return Math.min(this.montoFijo, subtotal); }
  descripcion() { return `Promoción (RD$ ${this.montoFijo} de descuento)`; }
}

// Calculadora de orden
class CalculadoraOrden {
  constructor(estrategiaDescuento = new SinDescuento()) {
    this.estrategia = estrategiaDescuento;
  }

  setEstrategia(estrategia) {
    this.estrategia = estrategia;
  }

  calcularTotal(servicios, repuestos) {
    const subtotal = servicios.reduce((s, srv) => s + srv.calcularTotal(), 0)
                   + repuestos.reduce((s, rep) => s + (rep.precio * rep.cantidad), 0);
    const descuento = this.estrategia.calcular(subtotal);
    const itbis = (subtotal - descuento) * 0.18;
    return {
      subtotal,
      descuento,
      descuentoDescripcion: this.estrategia.descripcion(),
      itbis,
      total: subtotal - descuento + itbis
    };
  }
}

// Uso
const calc = new CalculadoraOrden();
calc.setEstrategia(new DescuentoClienteFrecuente());
const resumen = calc.calcularTotal(servicios, repuestos);
```

---

### 2.6 Builder (Constructor) — Creación de Órdenes de Servicio complejas

**Propósito:** Construir objetos `OrdenServicio` complejos paso a paso.

**Problema que resuelve:** Una orden puede tener muchos campos opcionales (mecánico asignado, múltiples servicios, repuestos, notas internas). El constructor simple sería inmanejable.

**Implementación:**

```javascript
class OrdenServicioBuilder {
  constructor() {
    this.orden = {
      id: null,
      cliente: null,
      vehiculo: null,
      mecanico: null,
      servicios: [],
      repuestos: [],
      notas: '',
      prioridad: 'normal',
      fechaEntregaEstimada: null,
      estado: 'Recibida'
    };
  }

  conCliente(cliente) { this.orden.cliente = cliente; return this; }
  conVehiculo(vehiculo) { this.orden.vehiculo = vehiculo; return this; }
  asignarMecanico(mecanico) { this.orden.mecanico = mecanico; return this; }
  agregarServicio(servicio) { this.orden.servicios.push(servicio); return this; }
  agregarRepuesto(repuesto) { this.orden.repuestos.push(repuesto); return this; }
  conNotas(notas) { this.orden.notas = notas; return this; }
  conPrioridad(prioridad) { this.orden.prioridad = prioridad; return this; }
  conEntregaEstimada(fecha) { this.orden.fechaEntregaEstimada = fecha; return this; }

  construir() {
    if (!this.orden.cliente) throw new Error('Cliente requerido');
    if (!this.orden.vehiculo) throw new Error('Vehículo requerido');
    if (this.orden.servicios.length === 0) throw new Error('Al menos un servicio requerido');
    this.orden.id = `OS-${Date.now()}`;
    return { ...this.orden };
  }
}

// Uso
const orden = new OrdenServicioBuilder()
  .conCliente(cliente)
  .conVehiculo(vehiculo)
  .asignarMecanico(mecanico)
  .agregarServicio(cambioAceite)
  .agregarServicio(reparacionFreno)
  .agregarRepuesto({ nombre: 'Pastillas de freno', precio: 850, cantidad: 2 })
  .conNotas('Cliente reporta ruido al frenar a alta velocidad')
  .conPrioridad('urgente')
  .conEntregaEstimada('2026-06-06')
  .construir();
```

---

### 2.7 Facade (Fachada) — API simplificada del módulo

**Propósito:** Proveer una interfaz simple al subsistema complejo de gestión de órdenes.

**Problema que resuelve:** El controlador o la interfaz de usuario no debería conocer los detalles de múltiples clases. La fachada los agrupa.

**Implementación:**

```javascript
class TallerFacade {
  constructor(ordenRepo, clienteRepo, vehiculoRepo, notificador) {
    this.ordenRepo = ordenRepo;
    this.clienteRepo = clienteRepo;
    this.vehiculoRepo = vehiculoRepo;
    this.notificador = notificador;
    this.calculadora = new CalculadoraOrden();
  }

  async crearOrden({ clienteId, vehiculoId, servicios, notas }) {
    const cliente = await this.clienteRepo.obtenerPorId(clienteId);
    const vehiculo = await this.vehiculoRepo.obtenerPorId(vehiculoId);

    const orden = new OrdenServicioBuilder()
      .conCliente(cliente)
      .conVehiculo(vehiculo)
      .conNotas(notas)
      .construir();

    servicios.forEach(s => orden.servicios.push(s));
    await this.ordenRepo.guardar(orden);
    await this.notificador.enviar(orden, 'ORDEN_CREADA');
    return orden;
  }

  async avanzarEstado(ordenId) {
    const orden = await this.ordenRepo.obtenerPorId(ordenId);
    orden.avanzar();
    await this.ordenRepo.guardar(orden);
    await this.notificador.enviar(orden, 'ESTADO_CAMBIADO');
    return orden;
  }

  async generarPresupuesto(ordenId) {
    const orden = await this.ordenRepo.obtenerPorId(ordenId);
    const resumen = this.calculadora.calcularTotal(orden.servicios, orden.repuestos);
    return { orden, resumen };
  }
}
```

---

## 3. Resumen de Patrones por Capa

| Capa | Patrón | Uso |
|---|---|---|
| Dominio | **State** | Ciclo de vida de la orden |
| Dominio | **Builder** | Construcción de órdenes complejas |
| Dominio | **Strategy** | Cálculo de precios y descuentos |
| Dominio | **Factory Method** | Creación de tipos de servicios |
| Infraestructura | **Repository** | Acceso a base de datos |
| Aplicación | **Observer** | Notificaciones automáticas |
| Aplicación | **Facade** | API unificada del módulo |

---

## 4. Arquitectura de Capas Recomendada

```
┌─────────────────────────────────┐
│         UI / Frontend           │  React / Views
├─────────────────────────────────┤
│      Capa de Aplicación         │  Facade, Casos de Uso
├─────────────────────────────────┤
│       Capa de Dominio           │  State, Builder, Strategy, Factory
├─────────────────────────────────┤
│    Capa de Infraestructura      │  Repository, Observer (notificaciones)
├─────────────────────────────────┤
│      Base de Datos / APIs       │  PostgreSQL, SMTP, SMS
└─────────────────────────────────┘
```

---

## 5. Esquema de Base de Datos (referencia)

```sql
CREATE TABLE clientes (
  id UUID PRIMARY KEY,
  nombre VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  es_frecuente BOOLEAN DEFAULT false
);

CREATE TABLE vehiculos (
  id UUID PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  marca VARCHAR(50),
  modelo VARCHAR(50),
  anio INTEGER,
  placa VARCHAR(20),
  kilometraje INTEGER
);

CREATE TABLE ordenes (
  id VARCHAR(30) PRIMARY KEY,
  cliente_id UUID REFERENCES clientes(id),
  vehiculo_id UUID REFERENCES vehiculos(id),
  mecanico_id UUID,
  estado VARCHAR(30) DEFAULT 'Recibida',
  prioridad VARCHAR(20) DEFAULT 'normal',
  notas TEXT,
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_entrega_estimada DATE,
  fecha_entrega_real TIMESTAMP
);

CREATE TABLE orden_servicios (
  id UUID PRIMARY KEY,
  orden_id VARCHAR(30) REFERENCES ordenes(id),
  tipo VARCHAR(30),
  descripcion TEXT,
  costo DECIMAL(10,2),
  tiempo_estimado INTEGER
);

CREATE TABLE orden_repuestos (
  id UUID PRIMARY KEY,
  orden_id VARCHAR(30) REFERENCES ordenes(id),
  nombre VARCHAR(100),
  precio DECIMAL(10,2),
  cantidad INTEGER
);

CREATE TABLE facturas (
  id UUID PRIMARY KEY,
  orden_id VARCHAR(30) REFERENCES ordenes(id),
  subtotal DECIMAL(10,2),
  descuento DECIMAL(10,2),
  itbis DECIMAL(10,2),
  total DECIMAL(10,2),
  fecha_emision TIMESTAMP DEFAULT NOW()
);
```

---

*Documento generado para el proyecto: Gestión de Órdenes de Servicio — Taller Mecánico*
