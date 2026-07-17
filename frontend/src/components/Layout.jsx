import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Wrench, Menu, X, LogOut, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useConfigStore } from '../store/configStore'
import { useState, useEffect } from 'react'
import { getNavItemsByRol } from '../config/navigationConfig'

/**
 * Layout.jsx — Shell principal de la aplicación
 *
 * Mejoras UI/UX implementadas:
 *  1. Sidebar colapsable en desktop: icono + texto ↔ solo icono
 *  2. Estado de colapso persistido en localStorage
 *  3. Tooltips al colapsar para accesibilidad
 *  4. Transición suave con CSS transition-all
 */
export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { fetchConfig, config } = useConfigStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)          // mobile
  const [collapsed, setCollapsed] = useState(() => {              // desktop
    try { return localStorage.getItem('sidebar-collapsed') === 'true' } catch { return false }
  })

  const navItems = getNavItemsByRol(user?.rol || 'ADMIN')

  useEffect(() => {
    fetchConfig()
  }, [])

  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', collapsed) } catch { /* noop */ }
  }, [collapsed])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">

      {/* ── Mobile overlay ─────────────────────────────── */}
      <div
        className={`fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── Sidebar ────────────────────────────────────── */}
      <div className={`
        fixed inset-y-0 left-0 bg-gradient-to-b from-slate-900 to-slate-800
        shadow-2xl z-50 flex flex-col
        transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${collapsed ? 'lg:w-[72px]' : 'lg:w-56 xl:w-64'}
        w-56
      `}>

        {/* ── Header ── */}
        <div className="relative h-16 px-3 bg-gradient-to-r from-[#0F9D6E] to-[#1A7FD4] text-white flex items-center justify-between overflow-hidden group flex-shrink-0">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          <div className="relative flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Wrench size={18} className="text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold uppercase tracking-wider leading-tight">SIGEST</p>
                <p className="text-[11px] opacity-80">Taller Mecánico</p>
              </div>
            )}
          </div>
          {/* Botón cerrar mobile */}
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ── Botón colapsar (solo desktop) ── */}
        <div className="hidden lg:flex justify-end px-2 pt-2 flex-shrink-0">
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            const Icon     = item.icon
            return (
              <div key={item.name} className="relative group/nav">
                <Link
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  title={collapsed ? item.name : undefined}
                  className={`relative flex items-center gap-2.5 px-2.5 py-2.5 transition-all duration-300 overflow-hidden ${
                    isActive
                      ? 'border-l-[3px] border-l-brand-primary text-white rounded-r-xl rounded-l-none'
                      : 'text-[#C3CED2] hover:text-white hover:bg-white/10 rounded-xl'
                  } ${collapsed ? 'justify-center' : ''}`}
                  style={isActive ? { background: 'linear-gradient(90deg, rgba(26,127,212,0.22), rgba(15,157,110,0.10))' } : {}}
                >
                  {/* shimmer effect */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/nav:opacity-10 translate-x-[-100%] group-hover/nav:translate-x-[100%] transition-all duration-500" />
                  )}
                  <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors duration-300 ${
                    isActive ? 'bg-white/10 text-brand-primary' : 'bg-white/5 group-hover/nav:bg-white/15 text-inherit'
                  }`}>
                    <Icon size={17} />
                  </div>
                  {!collapsed && (
                    <span className="font-semibold text-sm flex-1 truncate">{item.name}</span>
                  )}
                  {!collapsed && isActive && <ChevronRight size={15} className="opacity-75 flex-shrink-0" />}
                </Link>

                {/* Tooltip cuando está colapsado */}
                {collapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none
                    opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200">
                    <div className="bg-slate-700 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                      {item.name}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Divider ── */}
        <div className="px-4 py-1 flex-shrink-0">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* ── User Card ── */}
        <div className="px-2 pb-4 flex-shrink-0">
          {collapsed ? (
            /* Avatar compacto al colapsar */
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A7FD4] to-[#0F9D6E] flex items-center justify-center text-white font-bold text-sm">
                {(user?.nombre || 'A').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar sesión"
                className="p-2 bg-red-600/70 hover:bg-red-600 text-white rounded-lg transition-all duration-200"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F9D6E] to-[#1A7FD4] rounded-xl opacity-0 group-hover:opacity-75 blur transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A7FD4] to-[#0F9D6E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(user?.nombre || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.nombre || 'Administrador'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${user?.rol === 'ADMIN' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${user?.rol === 'ADMIN' ? 'text-amber-300' : 'text-emerald-300'}`}>
                        {user?.rol || 'ADMIN'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-300 group/btn hover:scale-105"
                >
                  <LogOut size={14} className="group-hover/btn:animate-bounce" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center px-4 sm:px-6 shadow-sm flex-shrink-0">
          {/* Hamburger mobile */}
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900 p-2 mr-3 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#0F9D6E] to-[#1A7FD4] bg-clip-text text-transparent">
              {navItems.find(item => item.path === location.pathname)?.name || 'SIGEST'}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <Outlet />
        </main>
      </div>

      <style>{`
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}