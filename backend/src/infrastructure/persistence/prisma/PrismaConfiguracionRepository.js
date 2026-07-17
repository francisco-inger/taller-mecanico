'use strict';

const prisma = require('./prismaClient');

/**
 * PrismaConfiguracionRepository — Repositorio de configuración del sistema
 *
 * Gestiona los parámetros globales del sistema (ITBIS, datos del negocio, tema).
 * Usa un modelo clave-valor para máxima flexibilidad sin migraciones adicionales.
 *
 * SOLID: SRP — única responsabilidad: acceso a la tabla `configuracion`.
 */
class PrismaConfiguracionRepository {
  /**
   * Obtiene el valor de una clave de configuración.
   * @param {string} clave
   * @returns {Promise<string|null>}
   */
  async obtener(clave) {
    const registro = await prisma.configuracion.findUnique({ where: { clave } });
    return registro ? registro.valor : null;
  }

  /**
   * Devuelve toda la configuración como un objeto plano { clave: valor }.
   * @returns {Promise<Record<string, string>>}
   */
  async listar() {
    const registros = await prisma.configuracion.findMany({
      orderBy: { clave: 'asc' },
    });
    return registros.reduce((acc, r) => {
      acc[r.clave] = r.valor;
      return acc;
    }, {});
  }

  /**
   * Crea o actualiza el valor de una clave.
   * @param {string} clave
   * @param {string} valor
   */
  async guardar(clave, valor) {
    await prisma.configuracion.upsert({
      where:  { clave },
      update: { valor: String(valor) },
      create: { clave, valor: String(valor) },
    });
  }

  /**
   * Guarda múltiples claves en una sola operación (transacción).
   * @param {Array<{ clave: string, valor: string }>} datos
   */
  async guardarVarios(datos) {
    await prisma.$transaction(
      datos.map(({ clave, valor }) =>
        prisma.configuracion.upsert({
          where:  { clave },
          update: { valor: String(valor) },
          create: { clave, valor: String(valor) },
        })
      )
    );
  }
}

module.exports = new PrismaConfiguracionRepository();
