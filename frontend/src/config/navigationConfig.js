/**
 * navigationConfig.js — Configuración de navegación por rol
 *
 * Antes: la lógica de autorización (qué menús ve cada rol) estaba
 *        embebida directamente en Layout.jsx mezclada con la vista.
 * Ahora: está separada en este archivo de configuración.
 *
 * Mejora: agregar un nuevo rol solo requiere editar este archivo.
 */

import {
  LayoutDashboard,
  Wrench,
  Users,
  Shield,
  Wrench as WrenchIcon,
  FileText,
  Settings,
} from 'lucide-react';

/** Todos los ítems de navegación disponibles */
const ALL_NAV_ITEMS = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'RECEPCIONISTA', 'MECANICO', 'CAJERO'],
  },
  {
    name: 'Órdenes',
    path: '/ordenes',
    icon: Wrench,
    roles: ['ADMIN', 'RECEPCIONISTA', 'MECANICO', 'CAJERO'],
  },
  {
    name: 'Clientes',
    path: '/clientes',
    icon: Users,
    roles: ['ADMIN', 'RECEPCIONISTA', 'CAJERO'],
  },
  {
    name: 'Usuarios',
    path: '/usuarios',
    icon: Shield,
    roles: ['ADMIN'],
  },
  {
    name: 'Equipo Técnico',
    path: '/mecanicos',
    icon: WrenchIcon,
    roles: ['ADMIN'],
  },
  {
    name: 'Facturación',
    path: '/facturacion',
    icon: FileText,
    roles: ['ADMIN', 'CAJERO', 'RECEPCIONISTA'],
  },
  {
    name: 'Configuración',
    path: '/configuracion',
    icon: Settings,
    roles: ['ADMIN'],
  },
];

/**
 * Retorna los ítems de navegación permitidos para un rol dado
 * @param {string} rol - 'ADMIN' | 'RECEPCIONISTA' | 'MECANICO' | 'CAJERO'
 * @returns {Array} ítems filtrados por rol
 */
export function getNavItemsByRol(rol) {
  return ALL_NAV_ITEMS.filter((item) => item.roles.includes(rol));
}

export default ALL_NAV_ITEMS;
