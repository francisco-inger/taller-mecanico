import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { Wrench, Menu, X, LogOut, ChevronRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import { getNavItemsByRol } from '../config/navigationConfig'

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = getNavItemsByRol(user?.rol || 'ADMIN');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/50 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-52 xl:w-64 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="relative h-20 px-4 py-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white flex items-center justify-between overflow-hidden group">
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform duration-300">
                <Wrench size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">SIGEST</p>
                <p className="text-xs opacity-90">Taller Mecánico</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white/70 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-xl scale-105`
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-500"></div>
                  )}
                  <div className={`relative flex items-center w-full gap-2 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform duration-300`}>
                    <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/25' : 'bg-white/5 group-hover:bg-white/15'} transition-colors duration-300`}>
                      <Icon size={18} />
                    </div>
                    <span className="font-semibold text-sm flex-1">{item.name}</span>
                    {isActive && <ChevronRight size={16} className="opacity-75" />}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Divider */}
          <div className="px-4 py-2">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* User Card */}
          <div className="px-2 pb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-75 blur transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-default">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-emerald-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(user?.nombre || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user?.nombre || 'Administrador'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${user?.rol === 'ADMIN' ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
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
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 h-14 flex items-center px-4 sm:px-6 shadow-sm">
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900 focus:outline-none p-2 mr-3 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
              {navItems.find(item => item.path === location.pathname)?.name || 'SIGEST'}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <Outlet />
        </main>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}