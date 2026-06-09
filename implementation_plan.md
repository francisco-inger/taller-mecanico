# Sistema de Órdenes de Servicio — Plan de Implementación Completo

Aplicación web full-stack para gestión de órdenes de servicio de un taller mecánico,
con arquitectura hexagonal, DDD táctico, patrones de diseño, seguridad con JWT/Keycloak,
Docker y validación de arquitectura.

---

## User Review Required

> [!IMPORTANT]
> Este plan cubre todo el sistema completo. La implementación se hará por fases incrementales.
> Cada fase produce código funcional y ejecutable.

> [!WARNING]
> **Keycloak** requiere al menos 512 MB de RAM para correr en Docker. Si tu PC tiene poca memoria,
> se puede usar **JWT puro con jsonwebtoken** como alternativa más liviana. Confirma cuál prefieres.

> [!NOTE]
> **ArchUnit** es una librería Java. Para Node.js se usará **dependency-cruiser** como equivalente
> (valida que el dominio no importe infraestructura, etc.). Si el proyecto debe ser Java, dímelo.

---

## Proposed Changes

### Estructura General del Repositorio

```
taller-mecanico/
├── backend/
├── frontend/
├── docker/
│   └── keycloak/
├── docs/
│   ├── contextoinicial.md
│   ├── patrones-diseno.md
│   └── api-endpoints.md
├── AGENTS.md              ← Documentación de IA
├── CLAUDE.md              ← Prompts y contexto IA
├── docker-compose.yml
└── README.md
```

---

### FASE 1 — Infraestructura Base y Docker

#### [NEW] `docker-compose.yml`
Levanta todos los servicios:
- **postgres** — Base de datos PostgreSQL 16
- **keycloak** — Servidor OAuth2/JWT (imagen oficial)
- **backend** — Node.js + Express
- **frontend** — React + Vite (con Nginx en producción)

#### [NEW] `docker/keycloak/realm-taller.json`
Configuración del realm de Keycloak con:
- Realm `taller-mecanico`
- Roles: `ADMIN`, `RECEPCIONISTA`, `MECANICO`, `CAJERO`
- Cliente OAuth2 configurado

#### [NEW] `AGENTS.md`
Documento de uso de IA con:
- Contexto del proyecto para Claude/Copilot
- Prompts utilizados para generar código
- Registro de decisiones asistidas por IA

#### [NEW] `CLAUDE.md`
Archivo de contexto para Claude con instrucciones del sistema, patrones y convenciones.

---

### FASE 2 — Dominio (DDD Táctico + Patrones)

#### Aggregate Root
#### [NEW] `backend/src/domain/orden/OrdenServicio.js`
- **Aggregate Root** principal del sistema
- Encapsula toda la lógica de negocio de una orden
- Aplica patrón **State** para gestión de estados
- Emite **Domain Events** al cambiar estado

#### Value Objects
#### [NEW] `backend/src/domain/orden/valueObjects/OrdenId.js`
- **Value Object** inmutable que representa el ID de una orden
- Valida formato `OS-YYYYMMDD-XXXX`
- SOLID: Single Responsibility + encapsulamiento

#### [NEW] `backend/src/domain/orden/valueObjects/Prioridad.js`
- **Value Object** para prioridad: `normal | urgente | VIP`
- Inmutable, con validación en constructor

#### [NEW] `backend/src/domain/orden/valueObjects/Dinero.js`
- **Value Object** para montos en RD$ con ITBIS
- Operaciones aritméticas seguras (evita errores de float)

#### Domain Events
#### [NEW] `backend/src/domain/orden/events/OrdenCreadaEvent.js`
- **Domain Event** emitido al crear una orden
- Contiene snapshot del estado inicial

#### [NEW] `backend/src/domain/orden/events/EstadoCambiadoEvent.js`
- **Domain Event** emitido en cada transición de estado
- Disparador del patrón **Observer**

#### Patrón State — Estados de la Orden
#### [NEW] `backend/src/domain/orden/estados/` (8 archivos)
- `EstadoRecibida.js`, `EstadoEnDiagnostico.js`, `EstadoPresupuestada.js`
- `EstadoAprobada.js`, `EstadoEnReparacion.js`, `EstadoLista.js`
- `EstadoEntregada.js`, `EstadoFacturada.js`, `EstadoRechazada.js`
- Cada uno define qué acciones se permiten y a qué estado transiciona

#### Patrón Factory Method — Servicios
#### [NEW] `backend/src/domain/servicio/ServicioFactory.js`
- Crea instancias de `ServicioMantenimiento`, `ServicioReparacion`, `ServicioDiagnostico`
- SOLID: Open/Closed (extensible sin modificar la fábrica)

#### Patrón Strategy — Descuentos
#### [NEW] `backend/src/domain/presupuesto/estrategias/`
- `SinDescuento.js`, `DescuentoClienteFrecuente.js`
- `DescuentoCorporativo.js`, `DescuentoPromocion.js`
- `CalculadoraOrden.js` — contexto que usa la estrategia

#### Patrón Builder
#### [NEW] `backend/src/domain/orden/OrdenServicioBuilder.js`
- Construcción fluida de órdenes paso a paso
- Validación en `construir()` (requiere cliente, vehículo y al menos 1 servicio)

---

### FASE 3 — Aplicación (Casos de Uso + Facade + Observer)

#### Patrón Facade
#### [NEW] `backend/src/application/TallerFacade.js`
- Punto de entrada unificado para todas las operaciones
- Orquesta: Repository + Builder + Factory + Strategy + EventBus
- SOLID: Dependency Inversion (recibe repositorios por inyección)

#### EventBus (Observer)
#### [NEW] `backend/src/application/EventBus.js`
- Bus de eventos in-process
- Conecta Domain Events con los observadores concretos

#### Casos de Uso
#### [NEW] `backend/src/application/casos-de-uso/`
- `CrearOrdenUseCase.js`
- `AvanzarEstadoUseCase.js`
- `GenerarPresupuestoUseCase.js`
- `AprobarPresupuestoUseCase.js`
- `GenerarFacturaUseCase.js`

---

### FASE 4 — Infraestructura (Repository + Notificaciones + Auth)

#### Patrón Repository
#### [NEW] `backend/src/infrastructure/persistence/OrdenRepositoryPG.js`
- Implementación PostgreSQL con **Prisma ORM**
- Extiende la interfaz abstracta `OrdenRepository`

#### [NEW] `backend/src/infrastructure/persistence/OrdenRepositoryMemoria.js`
- Implementación en memoria para **tests unitarios**

#### Observadores concretos
#### [NEW] `backend/src/infrastructure/notifications/`
- `NotificadorEmail.js` — Nodemailer
- `NotificadorSMS.js` — Twilio
- `BitacoraAuditoria.js` — logging a BD

#### Autenticación
#### [NEW] `backend/src/infrastructure/auth/KeycloakAdapter.js`
- Verifica tokens JWT emitidos por Keycloak
- Extrae roles del token para autorización

#### [NEW] `backend/src/infrastructure/auth/authMiddleware.js`
- Middleware Express que protege rutas
- Verifica JWT y adjunta usuario al request

#### Schema de Base de Datos
#### [NEW] `backend/prisma/schema.prisma`
```
Modelos: Cliente, Vehiculo, Orden, OrdenServicio,
         OrdenRepuesto, Factura, Mecanico, Usuario
```

---

### FASE 5 — Interfaz HTTP (Express)

#### [NEW] `backend/src/interfaces/http/routes/`
- `ordenRoutes.js`, `clienteRoutes.js`, `vehiculoRoutes.js`
- `facturaRoutes.js`, `dashboardRoutes.js`, `authRoutes.js`

#### [NEW] `backend/src/interfaces/http/controllers/`
- `OrdenController.js`, `ClienteController.js`, etc.
- Respuesta estándar: `{ success, data, message }`

---

### FASE 6 — Frontend (React + Vite + Tailwind)

#### Páginas principales
#### [NEW] `frontend/src/pages/`
- `Dashboard.jsx` — Kanban de órdenes + métricas
- `Ordenes.jsx` — Lista y detalle de órdenes
- `NuevaOrden.jsx` — Formulario de creación (usa Builder en backend)
- `Clientes.jsx` — Gestión de clientes
- `Mecanicos.jsx` — Carga de trabajo
- `Facturacion.jsx` — Presupuestos y facturas
- `Login.jsx` — Autenticación con Keycloak

#### Componentes reutilizables
#### [NEW] `frontend/src/components/`
- `BadgeEstado.jsx` — Badge de colores por estado de orden
- `KanbanBoard.jsx` — Tablero de órdenes por estado
- `TablaOrdenes.jsx`
- `ModalNuevaOrden.jsx`
- `Layout.jsx` — Sidebar + header con rol del usuario

---

### FASE 7 — Validación de Arquitectura

#### [NEW] `.dependency-cruiser.js`
Reglas que validan la arquitectura hexagonal:
- `domain/` **NO puede** importar de `infrastructure/` ni `interfaces/`
- `application/` **NO puede** importar de `infrastructure/` ni `interfaces/`
- `infrastructure/` puede importar de `domain/` y `application/`
- `interfaces/` puede importar de `application/` pero no de `infrastructure/` directamente

#### [NEW] `backend/tests/arch/arquitectura.test.js`
Tests Jest que ejecutan dependency-cruiser y fallan si se violan las reglas.

---

### FASE 8 — Documentación IA

#### [NEW] `AGENTS.md`
```markdown
# AGENTS.md — Proyecto Taller Mecánico
## Herramientas de IA utilizadas
## Prompts clave usados
## Decisiones asistidas por IA
## Cómo continuar el proyecto con IA
```

#### [NEW] `CLAUDE.md`
```markdown
# CLAUDE.md — Contexto del Sistema
## Stack y convenciones
## Patrones implementados
## Cómo contribuir código
```

---

## Mapa de Principios SOLID Aplicados

| Clase | Principio(s) |
|---|---|
| `OrdenServicio` (Aggregate) | **SRP** — solo gestiona el ciclo de vida de la orden |
| `ServicioFactory` | **OCP** — abierto a nuevos tipos sin modificar |
| `OrdenRepository` (interfaz) | **DIP** — la app depende de abstracción, no de PG |
| `EstadoRecibida`, `EstadoAprobada`... | **LSP** — son intercambiables por el contrato Estado |
| `CalculadoraOrden` con Strategy | **OCP + DIP** — estrategia inyectada, intercambiable |
| `TallerFacade` | **DIP** — recibe repositorios por constructor |
| Casos de uso individuales | **ISP** — cada uno tiene una sola responsabilidad |

---

## Mapa de Patrones (Tarea 2)

| Patrón | Clase(s) | Capa |
|---|---|---|
| **State** | `EstadoRecibida`, `EstadoAprobada`... | Domain |
| **Observer** | `EventBus`, `NotificadorSMS`, `BitacoraAuditoria` | Application/Infra |
| **Factory Method** | `ServicioFactory` | Domain |
| **Repository** | `OrdenRepositoryPG`, `OrdenRepositoryMemoria` | Infrastructure |
| **Strategy** | `DescuentoClienteFrecuente`, `CalculadoraOrden` | Domain |
| **Builder** | `OrdenServicioBuilder` | Domain |
| **Facade** | `TallerFacade` | Application |

---

## Open Questions

> [!IMPORTANT]
> **¿Keycloak completo o JWT simple?**
> - Keycloak = más robusto pero requiere 512MB+ de RAM en Docker
> - JWT con `jsonwebtoken` = más liviano, implementación propia de login
>
> Recomiendo **JWT simple** para desarrollo y que dejes anotado en AGENTS.md que en producción se migraría a Keycloak.

> [!IMPORTANT]
> **¿Implementamos el frontend completo o nos enfocamos primero en el backend?**
> El backend con todos los patrones y arquitectura hexagonal ya es bastante extenso.
> Opción A: Backend primero + Swagger docs → luego frontend
> Opción B: Ambos en paralelo desde el inicio

---

## Verification Plan

### Automated Tests
```bash
# Tests del dominio
npm test                          # Jest unit tests

# Validación de arquitectura
npm run arch:check                # dependency-cruiser

# Levantar todo con Docker
docker-compose up --build

# Verificar endpoints
curl http://localhost:3000/api/health
```

### Manual Verification
- [ ] Login con Keycloak desde el navegador
- [ ] Crear una orden y verificar transición de estados
- [ ] Generar presupuesto con descuento cliente frecuente
- [ ] Dashboard muestra las métricas correctamente
- [ ] Las reglas de arquitectura fallan si se viola la separación de capas
