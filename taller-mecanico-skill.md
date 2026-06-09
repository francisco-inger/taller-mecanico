---
name: taller-mecanico-skill
description: >
  Usar esta skill cuando el usuario trabaje en el proyecto "Sistema de Órdenes de Servicio para Taller Mecánico".
  Activa cuando el usuario menciona: orden de servicio, taller, mecánico, vehículo, cliente taller,
  presupuesto taller, factura taller, asignación mecánico, estado orden, repuestos, diagnóstico taller,
  contextoinicial taller, o cualquier referencia al desarrollo de esta aplicación específica.
---

# SKILL: Sistema de Órdenes de Servicio — Taller Mecánico

## Contexto del Proyecto

Estás asistiendo en el desarrollo de una aplicación web para gestión de órdenes de servicio de un taller mecánico. El proyecto usa **React + Vite** en el frontend y **Node.js + Express + PostgreSQL + Prisma** en el backend. La arquitectura sigue principios de **Domain-Driven Design (DDD)** con capas separadas.

---

## Stack y Convenciones

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Prisma ORM
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT
- **Notificaciones:** Nodemailer + Twilio SMS
- **Testing:** Jest + Supertest
- **Lenguaje:** JavaScript (ES2022+), sin TypeScript salvo que se indique

**Convenciones de código:**
- Nombres en español para dominio (entidades, campos, rutas)
- Nombres en inglés para estructura técnica (components, hooks, services)
- Funciones asíncronas con async/await
- Manejo de errores con try/catch y mensajes descriptivos

---

## Patrones de Diseño Implementados

Siempre que escribas código para este proyecto, respeta los siguientes patrones ya definidos:

| Patrón | Aplicación en el proyecto |
|---|---|
| **State** | Ciclo de vida de `OrdenServicio` (Recibida → Diagnóstico → Presupuestada → Aprobada → En Reparación → Lista → Entregada → Facturada) |
| **Observer** | Notificaciones automáticas al cambiar estado de orden |
| **Factory Method** | Creación de tipos de servicio: mantenimiento, reparación, diagnóstico |
| **Repository** | Abstracción de acceso a BD: `OrdenRepositoryPG` / `OrdenRepositoryMemoria` |
| **Strategy** | Cálculo de descuentos: `SinDescuento`, `DescuentoClienteFrecuente`, `DescuentoCorporativo`, `DescuentoPromocion` |
| **Builder** | Construcción paso a paso de `OrdenServicio` vía `OrdenServicioBuilder` |
| **Facade** | `TallerFacade` como punto de entrada unificado para operaciones del módulo |

---

## Entidades Clave del Dominio

```
OrdenServicio       → documento central del trabajo
Cliente             → propietario del vehículo
Vehiculo            → auto/moto/camión a reparar (vinculado a cliente)
Mecanico            → técnico asignado a la orden
Servicio            → trabajo específico (tipo: mantenimiento/reparacion/diagnostico)
Repuesto            → pieza utilizada en la reparación
Factura             → documento de cobro generado al finalizar
```

---

## Estados de una Orden (patrón State)

```
Recibida → En Diagnóstico → Presupuestada → Aprobada → En Reparación → Lista → Entregada → Facturada
                                  ↓
                             Rechazada (cierre)
```

---

## Roles del Sistema

- **Administrador** — acceso total
- **Recepcionista** — crea órdenes, gestiona clientes/vehículos
- **Mecánico** — ve sus órdenes asignadas, actualiza estado
- **Cajero** — aprueba presupuestos, genera facturas

---

## Endpoints Principales

```
POST   /api/clientes
GET    /api/clientes/:id/historial

POST   /api/vehiculos

POST   /api/ordenes
GET    /api/ordenes               (filtros: estado, mecanicoId, fecha)
GET    /api/ordenes/:id
PATCH  /api/ordenes/:id/estado
POST   /api/ordenes/:id/servicios
POST   /api/ordenes/:id/repuestos

GET    /api/ordenes/:id/presupuesto
POST   /api/ordenes/:id/aprobar

POST   /api/facturas/:ordenId
GET    /api/facturas/:id/pdf

GET    /api/dashboard/resumen
```

---

## Estructura de Carpetas

```
backend/src/
  domain/orden/          ← State, Builder, entidades de dominio
  domain/factura/
  application/           ← Facade, casos de uso, Observer
  infrastructure/        ← Repositorios PostgreSQL, notificadores
  interfaces/            ← Rutas Express, controladores

frontend/src/
  components/            ← UI reutilizable (Tabla, Modal, BadgeEstado)
  pages/                 ← Órdenes, Clientes, Vehículos, Dashboard
  hooks/                 ← useOrden, useCliente, usePresupuesto
  services/              ← Llamadas REST al backend
  context/               ← AuthContext, OrdenContext
```

---

## Instrucciones para el Asistente

Cuando trabajes en este proyecto:

1. **Mantén los patrones** — Si el usuario pide crear un nuevo servicio, usa `ServicioFactory`. Si modifica estados, usa el patrón `State`. No rompas la arquitectura establecida.

2. **Código completo y funcional** — Genera código listo para copiar, sin placeholders vagos como `// lógica aquí`. Incluye imports necesarios.

3. **Consistencia de nombres** — Usa los nombres exactos de las entidades y patrones ya definidos (`OrdenServicioBuilder`, `TallerFacade`, `EstadoAprobada`, etc.).

4. **ITBIS incluido** — Los cálculos de factura siempre consideran 18% de ITBIS (República Dominicana).

5. **Moneda en RD$** — Los precios se expresan en pesos dominicanos (RD$).

6. **Si el usuario pide un componente React** — Usa Tailwind CSS, sin CSS externo. El componente debe ser funcional con hooks.

7. **Si el usuario pide un endpoint** — Incluye: validación de entrada, manejo de errores con try/catch, respuesta JSON estándar `{ success, data, message }`.

8. **Al crear migraciones Prisma** — Respeta el schema de tablas: `clientes`, `vehiculos`, `ordenes`, `orden_servicios`, `orden_repuestos`, `facturas`, `mecanicos`.

---

## Respuesta Estándar del API

```javascript
// Éxito
res.json({ success: true, data: resultado, message: 'Operación exitosa' });

// Error
res.status(400).json({ success: false, data: null, message: 'Descripción del error' });
```

---

## Prompt de Inicio de Sesión

Usa este texto al comenzar una sesión de trabajo en el proyecto:

```
Estoy trabajando en el sistema de "Órdenes de Servicio para Taller Mecánico".
Stack: React + Node.js + Express + PostgreSQL + Prisma.
Patrones implementados: State (ciclo de vida de orden), Observer (notificaciones),
Factory Method (servicios), Repository (acceso a datos), Strategy (descuentos),
Builder (construcción de órdenes), Facade (TallerFacade como API del módulo).
Moneda: RD$ | ITBIS: 18% | País: República Dominicana.
Contexto completo en contextoinicial.md.

Tarea de hoy: [DESCRIBE AQUÍ LO QUE VAS A DESARROLLAR]
```
