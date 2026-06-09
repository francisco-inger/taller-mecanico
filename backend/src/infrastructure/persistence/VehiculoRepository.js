'use strict';

class VehiculoRepository {
  async obtenerPorId(id)          { throw new Error('No implementado'); }
  async listarPorCliente(clienteId) { throw new Error('No implementado'); }
  async crear(datos)              { throw new Error('No implementado'); }
  async actualizar(id, datos)     { throw new Error('No implementado'); }
}

module.exports = VehiculoRepository;
