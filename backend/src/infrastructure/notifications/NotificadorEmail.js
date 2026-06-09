'use strict';

/**
 * NotificadorEmail — Observador concreto (Patrón Observer)
 *
 * Envía emails al cliente cuando la orden cambia de estado.
 * Simula el envío en desarrollo (solo log).
 *
 * En producción: configurar SMTP_HOST, SMTP_USER, SMTP_PASS en .env
 */
class NotificadorEmail {
  async manejar(evento) {
    if (evento.nombre === 'EstadoCambiado') {
      const mensajes = {
        EN_DIAGNOSTICO: 'Su vehículo está siendo diagnosticado.',
        PRESUPUESTADA:  'Su presupuesto está listo para revisión.',
        APROBADA:       'Su presupuesto fue aprobado. Iniciamos la reparación.',
        EN_REPARACION:  'Su vehículo está en reparación.',
        LISTA:          '¡Su vehículo está listo para retirar!',
        ENTREGADA:      'Su vehículo fue entregado. ¡Gracias por confiar en nosotros!',
        RECHAZADA:      'El presupuesto fue rechazado. La orden ha sido cerrada.',
      };

      const msg = mensajes[evento.estadoNuevo] || `Estado: ${evento.estadoNuevo}`;
      console.log(`[EMAIL → cliente ${evento.clienteId}] Orden ${evento.ordenId}: ${msg}`);

      // TODO: Implementar envío real con Nodemailer en producción:
      // const transporter = nodemailer.createTransport({ host, port, auth });
      // await transporter.sendMail({ from, to, subject, text });
    }
  }
}

module.exports = NotificadorEmail;
