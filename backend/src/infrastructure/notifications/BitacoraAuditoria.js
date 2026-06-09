'use strict';

/**
 * BitacoraAuditoria — Observador concreto (Patrón Observer)
 *
 * Registra en consola (y opcionalmente en BD) cada cambio de estado.
 */
class BitacoraAuditoria {
  async manejar(evento) {
    const ts = new Date().toISOString();
    console.log(`[BITÁCORA ${ts}] Evento: ${evento.nombre} | Orden: ${evento.ordenId} | Estado: ${evento.estadoNuevo || 'N/A'}`);
  }
}

module.exports = BitacoraAuditoria;
