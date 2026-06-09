# CLAUDE.md — Contexto del Sistema para IA

> Este archivo es leído automáticamente por Claude/Antigravity al inicio de cada sesión.
> Mantenerlo actualizado con cada cambio arquitectónico importante.

---

## 🎯 Proyecto
**Sistema de Órdenes de Servicio para Taller Mecánico**  
Autor: Francisco R. Diaz | País: República Dominicana | Moneda: RD$ | ITBIS: 18%

---

## 🧱 Stack Tecnológico

- **Backend:** Node.js 20 + Express 4 + CommonJS (require/module.exports)
- **ORM:** Prisma 5 + PostgreSQL 16
- **Auth:** JWT con jsonwebtoken + bcryptjs
- **Notificaciones:** Nodemailer (email)
- **Testing:** Jest + Supertest
- **Arquitectura:** dependency-cruiser para validar capas

---

## 🏗️ Arquitectura Hexagonal — Reglas de Dependencia

```
domain/         ← NO importa nada de infrastructure/ ni interfaces/
application/    ← Importa domain/, NO importa infrastructure/ ni interfaces/
infrastructure/ ← Importa domain/ y application/ (implementa contratos)
interfaces/     ← Importa application/ a través del container de DI
```

**Violación de estas reglas = falla en `npm run arch:check`**

---

## 📐 Patrones Implementados

| Patrón | Archivo(s) | Capa |
|---|---|---|
| State | `domain/orden/estados/*.js` | domain |
| Builder | `domain/orden/OrdenServicioBuilder.js` | domain |
| Factory Method | `domain/servicio/ServicioFactory.js` | domain |
| Strategy | `domain/presupuesto/CalculadoraOrden.js` + estrategias | domain |
| Observer | `application/EventBus.js` | application |
| Facade | `application/TallerFacade.js` | application |
| Repository | `infrastructure/persistence/*.js` | infrastructure |

---

## 🎯 DDD Táctico

- **Aggregate Root:** `OrdenServicio` — gestiona todo el ciclo de vida
- **Value Objects:** `OrdenId`, `Prioridad`, `Dinero` (inmutables, equals por valor)
- **Domain Events:** `OrdenCreadaEvent`, `EstadoCambiadoEvent` (patrón pull)
- **Repositorios abstractos:** en `infrastructure/persistence/` (base classes)

---

## 👥 Roles del Sistema

| Rol | Constante | Permisos |
|---|---|---|
| Administrador | `ADMIN` | Todo |
| Recepcionista | `RECEPCIONISTA` | Crear órdenes, clientes, vehículos |
| Mecánico | `MECANICO` | Ver sus órdenes, actualizar estado |
| Cajero | `CAJERO` | Aprobar presupuestos, generar facturas |

---

## 🔄 Estados de Orden (patrón State)

```
Recibida → EnDiagnostico → Presupuestada → Aprobada → EnReparacion → Lista → Entregada → Facturada
                                 ↓
                            Rechazada (terminal)
```

---

## 📡 Respuesta estándar del API

```javascript
// Éxito
res.json({ success: true, data: resultado, message: 'Operación exitosa' });

// Error
res.status(400).json({ success: false, data: null, message: 'Error descriptivo' });
```

---

## 🚫 Convenciones — Lo que NO hacer

1. NO agregar lógica de negocio en controllers (va en UseCases)
2. NO importar Prisma directamente desde domain/ o application/
3. NO saltarse la jerarquía de capas (pasar por el Facade)
4. NO usar floats para calcular dinero (usar Dinero value object)
5. NO olvidar emitir Domain Events al cambiar estado de la orden

---

## 📋 Nombres de entidades (en español, como en el dominio del negocio)

```
OrdenServicio, Cliente, Vehiculo, Mecanico, Servicio, Repuesto, Factura, Usuario
```

---

## 🗂️ Estructura de directorios (backend/src/)

```
domain/
  shared/valueObjects/    → OrdenId, Prioridad, Dinero
  orden/
    estados/              → 10 clases de estado (patrón State)
    events/               → DomainEvent, OrdenCreadaEvent, EstadoCambiadoEvent
    OrdenServicio.js      → Aggregate Root
    OrdenServicioBuilder.js
  servicio/               → Servicio base + subclases + ServicioFactory
  presupuesto/
    estrategias/          → SinDescuento, DescuentoClienteFrecuente, etc.
    CalculadoraOrden.js

application/
  EventBus.js             → Observer (bus de eventos)
  TallerFacade.js         → Facade (punto de entrada unificado)
  casos-de-uso/           → Un usecase por operación

infrastructure/
  persistence/
    OrdenRepository.js    → Clase abstracta (interfaz)
    prisma/               → Implementaciones concretas con Prisma
    memoria/              → Implementaciones en memoria para tests
  notifications/          → Email, SMS, Bitácora
  auth/                   → JWT middleware

interfaces/
  http/
    container.js          → Wiring de dependencias (DI manual)
    app.js                → Express app
    server.js             → Entry point
    routes/
    controllers/
    middleware/
```
