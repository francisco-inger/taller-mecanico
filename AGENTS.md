# AGENTS.md — Sistema de Órdenes de Servicio para Taller Mecánico

**Autor:** Francisco R. Diaz  
**Proyecto:** Gestión de Órdenes de Servicio — Taller Mecánico  
**Fecha de inicio:** Junio 2026  
**IA utilizada:** Antigravity (Google DeepMind) — Claude Sonnet 4.6

---

## 🤖 Herramientas de IA Utilizadas

| Herramienta | Propósito | URL |
|---|---|---|
| **Antigravity / Claude** | Generación de arquitectura y código | https://antigravity.dev |
| **GitHub Copilot** | Autocompletado en editor | https://copilot.github.com |

---

## 📋 Prompts Clave Utilizados en el Desarrollo

### Prompt 1 — Contexto inicial del proyecto
```
Estoy trabajando en el sistema de "Órdenes de Servicio para Taller Mecánico".
Stack: React + Node.js + Express + PostgreSQL + Prisma.
Patrones implementados: State (ciclo de vida de orden), Observer (notificaciones),
Factory Method (servicios), Repository (acceso a datos), Strategy (descuentos),
Builder (construcción de órdenes), Facade (TallerFacade como API del módulo).
Moneda: RD$ | ITBIS: 18% | País: República Dominicana.
Contexto completo en contextoinicial.md.
```

### Prompt 2 — Arquitectura Hexagonal + DDD
```
Quiero implementar arquitectura hexagonal con DDD táctico:
- Al menos un Aggregate Root (OrdenServicio)
- Value Objects inmutables (OrdenId, Prioridad, Dinero)
- Domain Events (OrdenCreadaEvent, EstadoCambiadoEvent)
- Principios SOLID en todas las clases
- Separación estricta: domain/ no depende de infrastructure/
```

### Prompt 3 — Patrón State para el ciclo de vida de la orden
```
Implementa el patrón State para OrdenServicio con estos estados:
Recibida → En Diagnóstico → Presupuestada → Aprobada → En Reparación → Lista → Entregada → Facturada
Cada estado es una clase concreta que implementa avanzar(orden) y rechazar(orden).
El estado Presupuestada permite rechazar() hacia EstadoRechazada.
```

### Prompt 4 — Docker + validación de arquitectura
```
Configura docker-compose con: postgres:16, backend Node.js, frontend React.
Además configura dependency-cruiser para validar que el dominio no importe
de infraestructura ni de interfaces HTTP. Las violaciones deben fallar los tests.
```

### Prompt 5 — Autenticación JWT simple
```
Implementa autenticación JWT con jsonwebtoken y bcryptjs.
Roles: ADMIN, RECEPCIONISTA, MECANICO, CAJERO.
Middleware que verifica token en header Authorization: Bearer <token>.
Nota: en producción migrar a Keycloak/OAuth2.
```

---

## 🧠 Decisiones Asistidas por IA

| # | Decisión | Herramienta | Justificación |
|---|---|---|---|
| 1 | Usar CommonJS en vez de ESM | Claude | Mejor compatibilidad con Jest sin configuración extra |
| 2 | JWT simple en lugar de Keycloak | Claude | Más liviano para desarrollo; Keycloak para producción |
| 3 | dependency-cruiser en lugar de ArchUnit | Claude | ArchUnit es Java; dependency-cruiser es equivalente para Node.js |
| 4 | Patrón pull para Domain Events | Claude | Los eventos se acumulan en el Aggregate y se publican al guardar |
| 5 | Inyección de dependencias manual (container.js) | Claude | Evita librerías adicionales; suficiente para proyecto académico |
| 6 | Backend primero, frontend después | Francisco | Priorizar arquitectura hexagonal y patrones antes de la UI |

---

## 🗂️ Registro de Sesiones de Trabajo

### Sesión 1 — 04 de Junio 2026
- **Tarea:** Planificación y scaffolding completo del backend
- **Archivos generados por IA:** Todos los archivos del backend (fases 1-8)
- **Revisión humana:** Francisco R. Diaz revisó el plan y aprobó antes de la ejecución
- **Resultado:** Arquitectura hexagonal completa con todos los patrones de diseño

---

## 🚀 Cómo Continuar el Proyecto con IA

Para continuar cualquier sesión de trabajo, usa este prompt:

```
Contexto: Sistema de "Órdenes de Servicio para Taller Mecánico".
Stack: Node.js + Express + PostgreSQL + Prisma (backend) / React + Vite + Tailwind (frontend).
Arquitectura: Hexagonal (domain/application/infrastructure/interfaces).
Patrones: State, Observer, Factory, Repository, Strategy, Builder, Facade.
DDD: Aggregate (OrdenServicio), Value Objects (OrdenId, Prioridad, Dinero), Domain Events.
Auth: JWT con jsonwebtoken. ITBIS 18%. Moneda: RD$.
Tarea de hoy: [DESCRIBE AQUÍ]
```

---

## 📁 Archivos Generados con IA (no modificar manualmente sin entender el patrón)

- `backend/src/domain/orden/OrdenServicio.js` — Aggregate Root + patrón State
- `backend/src/domain/orden/OrdenServicioBuilder.js` — patrón Builder
- `backend/src/domain/servicio/ServicioFactory.js` — patrón Factory Method
- `backend/src/domain/presupuesto/CalculadoraOrden.js` — patrón Strategy
- `backend/src/application/EventBus.js` — patrón Observer
- `backend/src/application/TallerFacade.js` — patrón Facade
