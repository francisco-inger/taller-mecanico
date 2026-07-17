'use strict';
const ClienteRepository = require('../ClienteRepository');
const prisma = require('./prismaClient');
const { cifrar, descifrar } = require('../../../utils/encriptacion');

function mapearClienteDeBaseDeDatos(cliente) {
  if (!cliente) return null;
  return {
    ...cliente,
    cedula: descifrar(cliente.cedula),
    telefono: descifrar(cliente.telefono),
    email: descifrar(cliente.email),
  };
}

function mapearClienteParaBaseDeDatos(datos) {
  if (!datos) return null;
  return {
    ...datos,
    cedula: datos.cedula ? cifrar(datos.cedula) : undefined,
    telefono: datos.telefono ? cifrar(datos.telefono) : undefined,
    email: datos.email ? cifrar(datos.email) : undefined,
  };
}

class PrismaClienteRepository extends ClienteRepository {
  async obtenerPorId(id) {
    const cliente = await prisma.cliente.findUnique({ where: { id } });
    return mapearClienteDeBaseDeDatos(cliente);
  }
  async obtenerPorCedula(cedula) {
    // Si buscamos por cédula, debemos cifrar la cédula de búsqueda para poder hacer la consulta exacta.
    const cedulaCifrada = cifrar(cedula);
    const cliente = await prisma.cliente.findUnique({ where: { cedula: cedulaCifrada } });
    // Si no se encuentra con la cédula cifrada, puede ser que el registro sea heredado y esté en texto plano
    if (!cliente) {
      const clientePlano = await prisma.cliente.findUnique({ where: { cedula } });
      return mapearClienteDeBaseDeDatos(clientePlano);
    }
    return mapearClienteDeBaseDeDatos(cliente);
  }
  async crear(datos) {
    const { vehiculo, ...datosCliente } = datos;
    const datosMapeados = mapearClienteParaBaseDeDatos(datosCliente);
    const cliente = await prisma.cliente.create({ data: datosMapeados });
    return mapearClienteDeBaseDeDatos(cliente);
  }
  async actualizar(id, datos) {
    const { vehiculo, ...datosCliente } = datos;
    const datosMapeados = mapearClienteParaBaseDeDatos(datosCliente);
    const cliente = await prisma.cliente.update({ where: { id }, data: datosMapeados });
    return mapearClienteDeBaseDeDatos(cliente);
  }
  async listar() {
    const lista = await prisma.cliente.findMany({ orderBy: { nombre: 'asc' } });
    return lista.map(mapearClienteDeBaseDeDatos);
  }
}
module.exports = PrismaClienteRepository;