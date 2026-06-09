'use strict';

/**
 * CrearClienteUseCase — Caso de Uso
 */
class CrearClienteUseCase {
  constructor(clienteRepo) {
    this._clienteRepo = clienteRepo;
  }

  async ejecutar({ nombre, telefono, email, cedula, esFrecuente = false }) {
    if (!nombre)    throw new Error('nombre es requerido');
    if (!telefono)  throw new Error('telefono es requerido');

    // Verificar cédula única si se especifica
    if (cedula) {
      const existente = await this._clienteRepo.obtenerPorCedula(cedula);
      if (existente) throw new Error(`Ya existe un cliente con cédula "${cedula}"`);
    }

    return this._clienteRepo.crear({ nombre, telefono, email, cedula, esFrecuente });
  }
}

module.exports = CrearClienteUseCase;
