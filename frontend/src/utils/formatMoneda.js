/**
 * formatMoneda.js — Utilidad centralizada para formato de moneda
 *
 * Antes: esta lógica estaba duplicada en Ordenes.jsx y Facturacion.jsx
 * Ahora: un solo lugar para cambiar locale o moneda
 *
 * Mejora arquitectónica: separación presentación / lógica de formateo
 */

const LOCALE = 'es-DO';
const MONEDA = 'DOP';

/**
 * Formatea un valor numérico como moneda dominicana (RD$)
 * @param {number|string} valor
 * @returns {string} ej. "RD$ 1,500.00"
 */
export function formatMoneda(valor) {
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: MONEDA,
  }).format(Number(valor) || 0);
}

/**
 * Calcula el resumen financiero de una orden (subtotal, ITBIS 18%, total)
 * @param {{ servicios: Array, repuestos: Array }} orden
 * @param {number} descuento
 * @returns {{ subtotal, descuento, baseImponible, itbis, total }}
 */
export function calcularResumenOrden(orden, descuento = 0) {
  const subtotalServicios =
    orden.servicios?.reduce((acc, s) => acc + Number(s.costo), 0) || 0;
  const subtotalRepuestos =
    orden.repuestos?.reduce(
      (acc, r) => acc + Number(r.precio) * r.cantidad,
      0
    ) || 0;
  const subtotal = subtotalServicios + subtotalRepuestos;
  const desc = Number(descuento) || 0;
  const baseImponible = Math.max(0, subtotal - desc);
  const itbis = parseFloat((baseImponible * 0.18).toFixed(2));
  const total = parseFloat((baseImponible + itbis).toFixed(2));
  return { subtotal, descuento: desc, baseImponible, itbis, total };
}
