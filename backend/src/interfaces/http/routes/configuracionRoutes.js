'use strict';

const { Router } = require('express');
const { authMiddleware } = require('../container');
const requerirRoles    = require('../middleware/roleMiddleware');
const audit            = require('../middleware/auditMiddleware');
const configRepo       = require('../../../infrastructure/persistence/prisma/PrismaConfiguracionRepository');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/configuracion
 * Devuelve toda la configuración como { clave: valor }.
 * Accesible por todos los roles autenticados (necesitan leer ITBIS, moneda, nombre_taller).
 */
router.get('/', async (req, res, next) => {
  try {
    const config = await configRepo.listar();
    res.json({ success: true, data: config, message: 'OK' });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/configuracion
 * Guarda múltiples claves de configuración.
 * Body: { claves: [{ clave, valor }, ...] }
 * Solo ADMIN puede modificar la configuración del sistema.
 */
router.patch(
  '/',
  requerirRoles('ADMIN'),
  audit({ accion: 'ACTUALIZAR', entidad: 'CONFIGURACION', getEntidadId: () => 'sistema' }),
  async (req, res, next) => {
    try {
      const { claves } = req.body;

      if (!Array.isArray(claves) || claves.length === 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Se requiere un array "claves" con al menos una entrada { clave, valor }',
        });
      }

      // Validar que no vengan claves vacías
      const invalidas = claves.filter(k => !k.clave || k.valor === undefined);
      if (invalidas.length > 0) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Cada entrada debe tener "clave" y "valor"',
        });
      }

      await configRepo.guardarVarios(claves);
      const configActualizada = await configRepo.listar();

      res.json({
        success: true,
        data: configActualizada,
        message: `${claves.length} parámetro(s) de configuración actualizados`,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
