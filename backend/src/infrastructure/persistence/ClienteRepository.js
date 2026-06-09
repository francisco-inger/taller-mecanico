'use strict';

class ClienteRepository {
  async obtenerPorId(id)       { throw new Error('ClienteRepository.obtenerPorId() no implementado'); }
  async obtenerPorCedula(ced)  { throw new Error('ClienteRepository.obtenerPorCedula() no implementado'); }
  async crear(datos)           { throw new Error('ClienteRepository.crear() no implementado'); }
  async actualizar(id, datos)  { throw new Error('ClienteRepository.actualizar() no implementado'); }
  async listar()               { throw new Error('ClienteRepository.listar() no implementado'); }
}

module.exports = ClienteRepository;
