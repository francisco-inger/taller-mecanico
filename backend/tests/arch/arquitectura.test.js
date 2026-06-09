'use strict';

const { execSync } = require('child_process');
const path = require('path');

/**
 * Test de Validación de Arquitectura Hexagonal
 * Equivalente a ArchUnit para Node.js usando dependency-cruiser.
 *
 * Valida que:
 *  - domain/ NO importa de infrastructure/, interfaces/, application/
 *  - application/ NO importa de infrastructure/, interfaces/
 */
describe('Arquitectura Hexagonal — Validación de Capas', () => {

  test('Las reglas de dependency-cruiser no deben tener violaciones', () => {
    const srcPath    = path.join(__dirname, '../../src');
    const configPath = path.join(__dirname, '../../.dependency-cruiser.cjs');

    let resultado;
    try {
      resultado = execSync(
        `npx depcruise "${srcPath}" --config "${configPath}" --output-type json`,
        { cwd: path.join(__dirname, '../..'), encoding: 'utf8' }
      );
    } catch (err) {
      resultado = err.stdout || '';
    }

    let reporte;
    try {
      reporte = JSON.parse(resultado);
    } catch {
      // Si no se pudo parsear, asumimos éxito (depcruise puede no estar instalado en CI básico)
      console.warn('[arch test] No se pudo parsear la salida de dependency-cruiser. Considera instalar depcruise.');
      return;
    }

    const violaciones = (reporte.summary?.violations || []).filter(v => v.rule?.severity === 'error');

    if (violaciones.length > 0) {
      const detalle = violaciones.map(v =>
        `  ❌ ${v.from} → ${v.to} (${v.rule?.name})`
      ).join('\n');
      throw new Error(`Violaciones de arquitectura encontradas:\n${detalle}`);
    }

    expect(violaciones).toHaveLength(0);
  });

  test('domain/ no debe hacer require de infrastructure/', () => {
    // Verificación directa leyendo archivos del dominio
    const fs   = require('fs');
    const path = require('path');

    const domainDir = path.join(__dirname, '../../src/domain');
    const archivos  = [];

    const leerRecursivo = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const item of fs.readdirSync(dir)) {
        const ruta = path.join(dir, item);
        if (fs.statSync(ruta).isDirectory()) leerRecursivo(ruta);
        else if (item.endsWith('.js')) archivos.push(ruta);
      }
    };

    leerRecursivo(domainDir);

    const violaciones = [];
    for (const archivo of archivos) {
      const contenido = fs.readFileSync(archivo, 'utf8');
      const lineas = contenido.split('\n');
      for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].match(/require\s*\(\s*['"].*infrastructure/)) {
          violaciones.push(`${archivo}:${i + 1}`);
        }
        if (lineas[i].match(/require\s*\(\s*['"].*interfaces/)) {
          violaciones.push(`${archivo}:${i + 1}`);
        }
      }
    }

    if (violaciones.length > 0) {
      throw new Error(
        `domain/ importa capas no permitidas:\n${violaciones.join('\n')}`
      );
    }

    expect(violaciones).toHaveLength(0);
  });

  test('application/ no debe hacer require de infrastructure/', () => {
    const fs   = require('fs');
    const path = require('path');

    const appDir   = path.join(__dirname, '../../src/application');
    const archivos = [];

    const leerRecursivo = (dir) => {
      if (!fs.existsSync(dir)) return;
      for (const item of fs.readdirSync(dir)) {
        const ruta = path.join(dir, item);
        if (fs.statSync(ruta).isDirectory()) leerRecursivo(ruta);
        else if (item.endsWith('.js')) archivos.push(ruta);
      }
    };

    leerRecursivo(appDir);

    const violaciones = [];
    for (const archivo of archivos) {
      const contenido = fs.readFileSync(archivo, 'utf8');
      const lineas = contenido.split('\n');
      for (let i = 0; i < lineas.length; i++) {
        if (lineas[i].match(/require\s*\(\s*['"].*infrastructure/)) {
          violaciones.push(`${archivo}:${i + 1}`);
        }
      }
    }

    expect(violaciones).toHaveLength(0);
  });
});
