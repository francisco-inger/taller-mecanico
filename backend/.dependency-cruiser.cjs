'use strict';

/**
 * .dependency-cruiser.cjs — Validación de Arquitectura Hexagonal
 *
 * Equivalente a ArchUnit pero para Node.js.
 * Ejecutar: npm run arch:check
 *
 * Reglas que validan:
 *  - domain/ NO puede importar de infrastructure/ ni interfaces/
 *  - application/ NO puede importar de infrastructure/ ni interfaces/
 *  - infrastructure/ puede importar de domain/ y application/
 *  - interfaces/ puede importar de application/ (a través del facade)
 */
module.exports = {
  forbidden: [
    // ─────────────────────────────────────────────────────────────
    // Reglas del Dominio (núcleo puro — SIN dependencias externas)
    // ─────────────────────────────────────────────────────────────
    {
      name:    'domain-no-infrastructure',
      comment: 'El dominio NO debe depender de infraestructura (viola arquitectura hexagonal)',
      severity: 'error',
      from: { path: '^src/domain' },
      to:   { path: '^src/infrastructure' },
    },
    {
      name:    'domain-no-interfaces',
      comment: 'El dominio NO debe depender de interfaces HTTP',
      severity: 'error',
      from: { path: '^src/domain' },
      to:   { path: '^src/interfaces' },
    },
    {
      name:    'domain-no-application',
      comment: 'El dominio NO debe depender de la capa de aplicación',
      severity: 'error',
      from: { path: '^src/domain' },
      to:   { path: '^src/application' },
    },

    // ─────────────────────────────────────────────────────────────
    // Reglas de Aplicación (solo conoce el dominio)
    // ─────────────────────────────────────────────────────────────
    {
      name:    'application-no-infrastructure',
      comment: 'La aplicación NO debe importar directamente infraestructura',
      severity: 'error',
      from: { path: '^src/application' },
      to:   { path: '^src/infrastructure' },
    },
    {
      name:    'application-no-interfaces',
      comment: 'La aplicación NO debe depender de interfaces HTTP',
      severity: 'error',
      from: { path: '^src/application' },
      to:   { path: '^src/interfaces' },
    },
  ],

  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    moduleSystems: ['cjs'],
    tsPreCompilationDeps: false,
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
    },
  },
};
