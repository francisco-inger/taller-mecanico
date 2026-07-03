'use strict';

/**
 * CrearVehiculoUseCase — Caso de uso para registrar un vehículo
 *
 * Responsabilidad: valida las reglas de negocio antes de persistir.
 * La validación ya NO vive en el frontend (NuevaOrden.jsx); vive aquí.
 *
 * SOLID:
 *  - SRP: solo crea vehículos
 *  - DIP: recibe el repositorio por inyección
 */
class CrearVehiculoUseCase {
  /** @param {object} vehiculoRepo */
  constructor(vehiculoRepo) {
    this._vehiculoRepo = vehiculoRepo;
  }

  /**
   * @param {{ marca, modelo, anio, placa, color, kilometraje, clienteId }} datos
   * @returns {Promise<object>} vehículo creado
   * @throws {Error} si faltan campos obligatorios o el año es inválido
   */
  async ejecutar(datos) {
    // ── Reglas de negocio (antes estaban en NuevaOrden.jsx del frontend) ──
    const { marca, modelo, anio, placa, clienteId } = datos;

    const errores = [];
    if (!marca?.trim())    errores.push('La marca del vehículo es obligatoria.');
    if (!modelo?.trim())   errores.push('El modelo del vehículo es obligatorio.');
    if (!placa?.trim())    errores.push('La placa del vehículo es obligatoria.');
    if (!clienteId)        errores.push('El ID del cliente es obligatorio.');

    const anioNum = parseInt(anio, 10);
    const anioActual = new Date().getFullYear();
    if (!anio || isNaN(anioNum)) {
      errores.push('El año del vehículo es obligatorio y debe ser numérico.');
    } else if (anioNum < 1900 || anioNum > anioActual + 1) {
      errores.push(`El año debe estar entre 1900 y ${anioActual + 1}.`);
    }

    if (errores.length > 0) {
      const error = new Error(errores.join(' '));
      error.statusCode = 400;
      throw error;
    }

    // ── Persistencia ──
    return this._vehiculoRepo.crear({
      ...datos,
      anio: anioNum,
      kilometraje: parseInt(datos.kilometraje, 10) || 0,
    });
  }
}

module.exports = CrearVehiculoUseCase;
