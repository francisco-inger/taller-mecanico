# contextoinicial.md — Sistema de Órdenes de Servicio para Taller Mecánico

## 🎯 Descripción del Proyecto

Aplicación web para la gestión completa de órdenes de servicio en un taller mecánico. Cubre el ciclo de vida de un vehículo desde su recepción hasta la entrega y facturación, incluyendo asignación de mecánicos, control de repuestos, cálculo de presupuestos y notificaciones al cliente.

---

## 🧱 Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite |
| Estilos | Tailwind CSS |
| Backend | Node.js + Express |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Autenticación | JWT |
| Notificaciones | Nodemailer (email) / Twilio (SMS) |
| Testing | Jest + Supertest |
| Control de versiones | Git + GitHub |

---

## 🗂️ Estructura de Carpetas

```
taller-mecanico/
├── frontend/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables (Tabla, Modal, Badge)
│   │   ├── pages/            # Vistas principales (Órdenes, Clientes, Vehículos)
│   │   ├── hooks/            # Custom hooks (useOrden, useCliente)
│   │   ├── services/         # Llamadas a la API REST
│   │   └── context/          # Estado global (AuthContext, OrdenContext)
├── backend/
│   ├── src/
│   │   ├── domain/           # Lógica de negocio pura (patrones State, Builder, Strategy)
│   │   │   ├── orden/
│   │   │   ├── cliente/
│   │   │   └── factura/
│   │   ├── application/      # Casos de uso (Facade, Observer)
│   │   ├── infrastructure/   # Repositorios, base de datos, notificadores
│   │   └── interfaces/       # Rutas Express, controladores HTTP
│   ├── prisma/
│   │   └── schema.prisma
│   └── tests/
└── docs/
    ├── contextoinicial.md     ← este archivo
    ├── patrones-diseno.md
    └── api-endpoints.md
```

---

## 📋 Módulos del Sistema

### 1. Gestión de Clientes
- Registro, edición y búsqueda de clientes
- Historial de vehículos y órdenes por cliente
- Marcado de clientes frecuentes (aplica descuentos automáticos)

### 2. Gestión de Vehículos
- Registro de vehículo vinculado a cliente (marca, modelo, año, placa, km)
- Historial de servicios por vehículo
- Alertas de mantenimiento por kilometraje

### 3. Órdenes de Servicio *(módulo principal)*
- Creación de orden con cliente + vehículo + servicios
- Ciclo de estados: `Recibida → Diagnóstico → Presupuestada → Aprobada → En Reparación → Lista → Entregada → Facturada`
- Asignación de mecánico
- Registro de repuestos utilizados
- Notas internas y observaciones
- Prioridad: normal / urgente / VIP

### 4. Presupuestos
- Cálculo automático (servicios + repuestos + mano de obra)
- Aplicación de descuentos (cliente frecuente, corporativo, promoción)
- Cálculo de ITBIS (18%)
- Envío de presupuesto por email/WhatsApp al cliente

### 5. Mecánicos y Asignación
- Perfil de mecánico con especialidades
- Dashboard de carga de trabajo por mecánico
- Registro de tiempo trabajado por orden

### 6. Facturación
- Generación de factura al entregar el vehículo
- Historial de facturas
- Exportación en PDF

### 7. Dashboard / Reportes
- Órdenes por estado (tablero Kanban)
- Ingresos del día / semana / mes
- Mecánico más productivo
- Servicios más solicitados

---

## 🔄 Flujo Principal de una Orden

```
1. Recepción del vehículo
   → Crear cliente si no existe
   → Registrar vehículo
   → Crear orden (estado: Recibida)

2. Diagnóstico
   → Mecánico asignado inspecciona
   → Registra servicios necesarios y repuestos
   → Estado: En Diagnóstico

3. Presupuesto
   → Sistema calcula costos automáticamente
   → Se envía al cliente (email/SMS)
   → Estado: Presupuestada

4. Aprobación
   → Cliente aprueba o rechaza
   → Si aprueba → Estado: Aprobada
   → Si rechaza → Estado: Rechazada (cierre)

5. Reparación
   → Mecánico ejecuta los trabajos
   → Estado: En Reparación

6. Control de calidad
   → Verificación interna
   → Estado: Lista para entrega

7. Entrega
   → Cliente recoge el vehículo
   → Firma de conformidad
   → Estado: Entregada

8. Facturación
   → Generación automática de factura
   → Estado: Facturada (cierre definitivo)
```

---

## 🎨 Patrones de Diseño Implementados

| Patrón | Dónde se aplica |
|---|---|
| **State** | Ciclo de vida de `OrdenServicio` |
| **Observer** | Notificaciones al cambiar estado |
| **Factory Method** | Creación de tipos de servicio |
| **Repository** | Acceso a datos (PostgreSQL / memoria) |
| **Strategy** | Cálculo de descuentos y precios |
| **Builder** | Construcción de órdenes complejas |
| **Facade** | API simplificada del módulo de taller |

> Ver detalle completo en `docs/patrones-diseno.md`

---

## 🔐 Roles y Permisos

| Rol | Acceso |
|---|---|
| **Administrador** | Todo el sistema, reportes, configuración |
| **Recepcionista** | Crear órdenes, gestionar clientes/vehículos |
| **Mecánico** | Ver sus órdenes asignadas, actualizar estado |
| **Cajero** | Aprobar presupuestos, generar facturas |

---

## 📡 Endpoints REST Principales

```
POST   /api/clientes              → Crear cliente
GET    /api/clientes/:id          → Obtener cliente
GET    /api/clientes/:id/historial → Historial de órdenes del cliente

POST   /api/vehiculos             → Registrar vehículo
GET    /api/vehiculos/:id         → Datos del vehículo

POST   /api/ordenes               → Crear orden de servicio
GET    /api/ordenes               → Listar órdenes (filtros: estado, mecánico, fecha)
GET    /api/ordenes/:id           → Detalle de orden
PATCH  /api/ordenes/:id/estado    → Avanzar estado
POST   /api/ordenes/:id/servicios → Agregar servicio
POST   /api/ordenes/:id/repuestos → Agregar repuesto

GET    /api/ordenes/:id/presupuesto → Calcular presupuesto
POST   /api/ordenes/:id/aprobar     → Aprobar presupuesto

POST   /api/facturas/:ordenId     → Generar factura
GET    /api/facturas/:id/pdf      → Descargar factura en PDF

GET    /api/dashboard/resumen     → Estadísticas generales
GET    /api/mecanicos/:id/carga   → Carga de trabajo del mecánico
```

---

## ⚙️ Variables de Entorno (.env)

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/taller_db

# JWT
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=8h

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=taller@email.com
SMTP_PASS=tu_contraseña

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_PHONE=+1234567890

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Comandos de Inicio

```bash
# Instalar dependencias
npm install

# Configurar base de datos
npx prisma migrate dev

# Poblar datos de prueba
npm run seed

# Iniciar en desarrollo
npm run dev

# Ejecutar tests
npm test
```

---

*Este archivo debe ser incluido al inicio de cada sesión de trabajo con el asistente IA para mantener el contexto del proyecto.*
