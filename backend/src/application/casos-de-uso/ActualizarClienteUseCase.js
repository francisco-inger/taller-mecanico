'use strict';
/**
 * ActualizarClienteUseCase — Caso de Uso
 */
class ActualizarClienteUseCase {
  constructor(clienteRepo) {
    this._clienteRepo = clienteRepo;
  }
  async ejecutar(id, datos) {
    if (!id) throw new Error('id es requerido');
    // Verificar si existe
    const cliente = await this._clienteRepo.obtenerPorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    // Si intenta cambiar la cedula, verificar que no este duplicada
    if (datos.cedula && datos.cedula !== cliente.cedula) {
      const existente = await this._clienteRepo.obtenerPorCedula(datos.cedula);
      if (existente) throw new Error(`Ya existe otro cliente con cédula "${datos.cedula}"`);
    }
    const { vehiculo, ...datosCliente } = datos;
    return this._clienteRepo.actualizar(id, datosCliente);
  }
}
module.exports = ActualizarClienteUseCase;