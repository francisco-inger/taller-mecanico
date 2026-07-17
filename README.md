# SIGEST — Sistema de Gestión de Órdenes de Servicio para Taller Mecánico



---

## 🎓 Información Académica
* **Estudiante:** Francisco R. Díaz
* **Matrícula:** 2023-3300016
* **Universidad:** Universidad Nacional Evangélica (UNEV)
* **Docente:** Ing. Carlos Artemio Escalante Lorenzo
* **Asignación:** Tarea 4 — Lógica de Negocio con Principios SOLID y Mejoras de UI/UX

---

## 🛠️ Stack Tecnológico
* **Backend:** Node.js (v18+) + Express
* **ORM & Database:** Prisma ORM + PostgreSQL 16
* **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons
* **Contenedores:** Docker & Docker Compose (entorno reproducible)
* **Pruebas de Arquitectura:** dependency-cruiser (valida reglas de acoplamiento)

---

## 📄 Documentos de Entrega (Tarea 4)

Los informes detallados con la justificación técnica de SOLID, el análisis UI/UX y la galería completa de capturas reales antes/después se encuentran en los siguientes archivos del repositorio:
* 📘 **Documento Word (Completo con Capturas):** [TAREA4_SOLID_UIUX_Francisco_Diaz.docx](file:///C:/Users/Francisco/Desktop/Órdenes de servicio para taller mecánico/TAREA4_SOLID_UIUX_Francisco_Diaz.docx)
* 🌐 **Documento Web Interactivo:** [TAREA4_SOLID_UIUX_Francisco_Diaz.html](file:///C:/Users/Francisco/Desktop/Órdenes de servicio para taller mecánico/TAREA4_SOLID_UIUX_Francisco_Diaz.html)

---

## 📐 Capa de Lógica de Negocio: Principios SOLID Aplicados

El backend sigue las directrices de la **Arquitectura Hexagonal** y **Domain-Driven Design (DDD)** táctico, garantizando que las reglas de negocio permanezcan desacopladas de detalles de infraestructura (HTTP, Base de Datos, Servicios Externos).

### 1. SRP — Single Responsibility Principle (Responsabilidad Única)
* **Antes:** Las rutas HTTP (como `vehiculo.routes.js`) realizaban directamente validación de datos, transformaciones de tipos (`parseInt`) y consultas de persistencia a la base de datos.
* **Después:** Se separó la lógica de negocio en casos de uso específicos (ej. `CrearVehiculoUseCase.js`). El controlador HTTP ahora tiene la única responsabilidad de recibir peticiones de red y delegar el flujo de datos.

### 2. OCP — Open/Closed Principle (Abierto/Cerrado)
* **Antes:** La lógica de cálculo de descuentos para presupuestos y facturación utilizaba condicionales (`if/else` o `switch`) dentro de `CalculadoraOrden.js`. Añadir un nuevo descuento significaba modificar esta clase.
* **Después:** Se implementó el **Patrón Strategy**. La calculadora recibe una estrategia de descuento (ej. `DescuentoClienteFrecuente.js`, `DescuentoCorporativo.js`, `SinDescuento.js`) que define el contrato `calcular(subtotal)`. Agregar nuevas promociones se hace mediante extensiones, no modificaciones de código existente.

### 3. LSP — Liskov Substitution Principle (Sustitución de Liskov)
* **Antes:** El ciclo de vida de la orden se gestionaba a través de validaciones condicionales dispersas en múltiples métodos del controlador y la entidad.
* **Después:** Se implementó el **Patrón State**. Se definió una base abstracta `EstadoOrden.js` y 10 subclases de estados concretos (`EstadoRecibida.js`, `EstadoEnDiagnostico.js`, `EstadoPresupuestada.js`, etc.). Todos los estados heredan los comportamientos y se pueden sustituir dinámicamente en tiempo de ejecución sin alterar el comportamiento de la clase `OrdenServicio.js`.

### 4. ISP — Interface Segregation Principle (Segregación de Interfaces)
* **Antes:** Los casos de uso dependían de objetos con interfaces gruesas como fachadas completas, exponiendo métodos y datos innecesarios a operaciones específicas.
* **Después:** Cada caso de uso (ej. `CrearOrdenUseCase.js`) define interfaces de dependencias estrictas en sus constructores, solicitando únicamente los repositorios que necesita (ej. `ordenRepo`, `clienteRepo`, `vehiculoRepo`) en lugar del subsistema o fachada completa.

### 5. DIP — Dependency Inversion Principle (Inversión de Dependencias)
* **Antes:** Las clases de lógica y controladores dependían directamente del ORM (PrismaClient) instanciado en el mismo archivo.
* **Después:** El contenedor de dependencias (`container.js`) realiza un cableado (DI manual). Las clases de negocio dependen de la abstracción `OrdenRepository.js`, y en runtime reciben la implementación concreta `PrismaOrdenRepository.js`, lo que permite intercambiar la persistencia por una base de datos en memoria para pruebas de integración rápidas.

---

## 🎨 Diseño Frontend: 8 Mejoras Profesionales de UI/UX

Se han integrado técnicas de usabilidad y accesibilidad en el frontend de React para ofrecer una experiencia limpia, intuitiva y profesional:

1. **Asistente / Wizard por Pasos (`NuevaOrden.jsx`):** Convierte el largo formulario original de creación de órdenes en un asistente guiado de 3 pasos (1. Cliente y Vehículo, 2. Servicios a realizar, 3. Resumen y confirmación). Incluye barra de progreso visual con indicación de etapas completadas/activas.
2. **Menú Lateral Colapsable (`Layout.jsx`):** Sidebar lateral de navegación que se puede colapsar a solo iconos en desktop para maximizar el área de trabajo. Su estado de visibilidad se persiste en `localStorage` y muestra tooltips al hacer hover sobre los iconos colapsados.
3. **DataGrid Profesional (`Ordenes.jsx`):** Tabla interactiva con encabezados de columna fijos, zebra-striping (filas alternadas), ordenamiento por columnas (Fecha, Cliente, Estado) en orden ascendente/descendente y paginación local fluida (10 filas por página).
4. **Ocultación de Opciones por Rol (`navigationConfig.js`):** La navegación superior y lateral se genera dinámicamente. Según el rol del usuario (`ADMIN`, `RECEPCIONISTA`, `MECANICO`, `CAJERO`), se filtran las opciones visibles. Por ejemplo, solo el administrador visualiza la gestión de usuarios, mecánicos y tiene acceso al botón de eliminación de órdenes.
5. **Retroalimentación Visual Instantánea (`Toast.jsx`):** Sistema asíncrono de alertas que elimina el uso de diálogos nativos bloqueantes (`window.alert`). Muestra notificaciones deslizantes no invasivas para éxitos, errores y carga.
6. **Ventanas Modales (`ConfirmModal.jsx`):** Reemplaza el uso de `window.confirm()` por modales estilizados con superposición translúcida que focaliza la atención del usuario en procesos importantes (ej. eliminar órdenes, facturar servicios).
7. **Paleta de Colores con Criterio Teórico (`index.css` & `tailwind.config.js`):** Paleta moderna y armoniosa basada en contrastes (WCAG AA). Se utilizan colores semánticos: Esmeralda (`#059669`) para guardar y éxito, Rojo (`#DC2626`) para eliminar y peligro, y Azul (`#2563EB`) para flujos continuos.
8. **Barra de Menú Superior (Header Dinámico):** Header principal con efecto de vidrio esmerilado (`backdrop-blur`) que lee la sección activa y despliega títulos y menús móviles de forma dinámica.

---

## 📂 Patrones de Diseño Implementados
* **State:** Control del flujo secuencial de la orden (Recibida → Diagnóstico → Presupuestada → Aprobada → Reparación → Lista → Entregada → Facturada).
* **Strategy:** Selección dinámica de descuentos aplicables sobre facturas y órdenes.
* **Builder:** Construcción parametrizada de agregados complejos (`OrdenServicioBuilder`).
* **Factory Method:** Instanciación polimórfica de tipos de servicios (`ServicioFactory`).
* **Observer:** Publicación y suscripción asíncrona de eventos de dominio (`EventBus`).
* **Facade:** Entrada limpia a la capa de aplicación (`TallerFacade`).
* **Repository:** Desacoplamiento de almacenamiento de datos.
* **Decorator:** Extensión dinámica de costos y detalles adicionales en los servicios (`ServicioDecorator`).

---

## ⚙️ Instrucciones de Ejecución

### 1. Entorno de Docker (Recomendado)
Para iniciar la base de datos, el backend y el frontend en un entorno idéntico a producción:
```bash
docker-compose up --build
```
El backend estará disponible en `http://localhost:5000` y el frontend en ` https://taller-mecanico-frontend-khc6.onrender.com.

### 2. Ejecución Local en Desarrollo
**Backend:**
1. Copiar `.env.example` a `.env` y configurar las credenciales de PostgreSQL.
2. Instalar dependencias e iniciar Prisma:
   ```bash
   cd backend
   npm install
   npx prisma migrate dev
   npm run dev
   ```

**Frontend:**
1. Instalar dependencias:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🚀 Últimas Mejoras y Correcciones (Fase Final)

Se realizaron optimizaciones críticas en la estabilidad del servidor, el flujo de transacciones contables, y la experiencia visual del usuario:

### 1. Robustez en el Flujo de Facturación (Backend & BD)
* **Transacciones Atómicas (`prisma.$transaction`):** Se rediseñó el caso de uso `GenerarFacturaUseCase.js` para ejecutar el avance de la orden a `FACTURADA` y la creación de la factura física de forma atómica en base de datos. Esto previene que una factura falle en crearse mientras la orden queda bloqueada en estado facturado sin soporte.
* **Migración a Supabase:** Se migró la base de datos de desarrollo y producción a una infraestructura en la nube administrada por Supabase (PostgreSQL serverless de AWS) garantizando alta disponibilidad.
* **Mapeo de Respuestas HTTP:** Corrección del middleware global `errorHandler.js` para categorizar los errores de reglas de negocio del dominio como `HTTP 400 (Bad Request)` en lugar de `HTTP 500 (Internal Server Error)`.

### 2. Correcciones de Condición de Carrera (Frontend)
* **Sincronización de Estado en Facturación:** Se corrigieron los flujos de creación y eliminación de facturas (`Facturacion.jsx`) aplicando llamadas asíncronas secuenciales con `await` sobre los refrescos del listado (`fetchFacturas`), asegurando que la interfaz refleje inmediatamente el cambio de la base de datos.
* **Actualización en Tiempo Real de Detalles:** Al avanzar el estado de una orden desde el panel de administración, el sistema actualiza automáticamente el visor lateral (`handleVerDetalle`) previniendo estados en caché.

### 3. Rediseño Profesional de UI/UX (Clientes y Nueva Orden)
* **Selector de Tiempo Amigable (Nueva Orden):** Se reemplazó el campo numérico simple de minutos por un control independiente de **Horas (h)** y **Minutos (m)**. Evita bloqueos y autocompletados molestos al momento de borrar el input, calculando el tiempo acumulado de manera transparente para el backend.
* **Desglose de Impuestos:** El resumen del Wizard de órdenes ahora detalla el Subtotal estimado, el cálculo de ITBIS (18%) y el Total estimado final de forma transparente.
* **Rediseño Premium de Clientes (`Clientes.jsx`):**
  * **Estructura de Directorio de Perfiles:** Cada tarjeta de cliente incorpora un banner superior degradado y un avatar flotante con anillo de profundidad tridimensional (`ring-4 ring-white shadow-lg`).
  * **Tags Frecuentes Automatizados:** Badges semánticos automáticos que marcan como `⭐ VIP` a clientes frecuentes basados en el dominio.
  * **Garaje de Vehículos Integrado:** Las listas de autos asociados se muestran como "Tarjetas de Garaje" compactas y modernas en paneles colapsables, con el número de placa resaltado en tags oscuros de alta legibilidad.

