'use strict';

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const helmet   = require('helmet');

const authRoutes     = require('./routes/authRoutes');
const ordenRoutes    = require('./routes/ordenRoutes');
const clienteRoutes  = require('./routes/clienteRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const facturaRoutes  = require('./routes/facturaRoutes');
const usuarioRoutes  = require('./routes/usuarioRoutes');
const mecanicoRoutes = require('./routes/mecanicoRoutes');
const logRoutes      = require('./routes/logRoutes');
const errorHandler   = require('./middleware/errorHandler');


/**
 * app.js — Configuración de la aplicación Express
 */
const app = express();

// ── Seguridad y parsers ───────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:  process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status:    'OK',
      timestamp: new Date().toISOString(),
      version:   '1.0.0',
      proyecto:  'Sistema Órdenes de Servicio — Taller Mecánico',
      autor:     'Francisco R. Diaz',
    },
    message: 'Servidor activo',
  });
});

// ── Rutas del API ─────────────────────────────────────────────
app.use('/api/auth',            authRoutes);
app.use('/api/ordenes',         ordenRoutes);
app.use('/api/clientes',        clienteRoutes);
app.use('/api/vehiculos',       vehiculoRoutes);
app.use('/api/facturas',        facturaRoutes);
app.use('/api/usuarios',        usuarioRoutes);
app.use('/api/mecanicos',       mecanicoRoutes);
app.use('/api/log-actividad',   logRoutes);   // Solo ADMIN — auditoría y trazabilidad


// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: `Ruta no encontrada: ${req.method} ${req.url}` });
});

// ── Manejador global de errores ───────────────────────────────
app.use(errorHandler);

module.exports = app;
