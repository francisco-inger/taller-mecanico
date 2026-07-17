import { useEffect } from 'react'
import { Clock, CheckCircle, Car, AlertTriangle, TrendingUp, ArrowUp, Zap, Users, Target } from 'lucide-react'
import { useOrdenStore } from '../store/ordenStore'
import { useMecanicoStore } from '../store/mecanicoStore'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { ordenes, fetchOrdenes, loading } = useOrdenStore()
  const { estadisticas: mecanicosStats, fetchEstadisticas } = useMecanicoStore()

  useEffect(() => {
    fetchOrdenes()
    fetchEstadisticas()
  }, [])

  // Calcular estadísticas básicas
  const stats = [
    { 
      title: 'Órdenes Activas', 
      value: ordenes.filter(o => !['ENTREGADA', 'FACTURADA', 'RECHAZADA'].includes(o.estado)).length, 
      icon: Car, 
      bgColor: 'bg-state-infoBg',
      textColor: 'text-state-info',
      iconBgColor: 'bg-state-info'
    },
    { 
      title: 'En Espera', 
      value: ordenes.filter(o => o.estado === 'RECIBIDA').length, 
      icon: Clock, 
      bgColor: 'bg-state-warningBg',
      textColor: 'text-state-warning',
      iconBgColor: 'bg-state-warning'
    },
    { 
      title: 'Urgentes', 
      value: ordenes.filter(o => o.prioridad === 'URGENTE' && !['ENTREGADA', 'FACTURADA', 'RECHAZADA'].includes(o.estado)).length, 
      icon: AlertTriangle, 
      bgColor: 'bg-state-dangerBg',
      textColor: 'text-state-danger',
      iconBgColor: 'bg-state-danger'
    },
    { 
      title: 'Total Órdenes', 
      value: ordenes.length, 
      icon: CheckCircle, 
      bgColor: 'bg-state-successBg',
      textColor: 'text-state-success',
      iconBgColor: 'bg-state-success'
    },
  ]

  const getStatusBadge = (estado) => {
    const styles = {
      'RECIBIDA': 'bg-state-warningBg text-state-warning',
      'EN_DIAGNOSTICO': 'bg-state-infoBg text-state-info',
      'PRESUPUESTADA': 'bg-state-warningBg text-state-warning',
      'APROBADA': 'bg-state-infoBg text-state-info',
      'EN_REPARACION': 'bg-state-infoBg text-state-info',
      'LISTA': 'bg-state-successBg text-state-success',
      'ENTREGADA': 'bg-state-successBg text-state-success',
      'RECHAZADA': 'bg-state-dangerBg text-state-danger',
      'FACTURADA': 'bg-state-successBg text-state-success',
    }
    return <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>{estado.replace(/_/g, ' ')}</span>
  }

  const ultimasOrdenes = ordenes.slice(0, 5)
  const mecanicosOcupados = mecanicosStats.filter(m => m.porcentajeOcupacion > 0).length

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Resumen de Actividad</h2>
          <p className="text-gray-500 mt-1">Bienvenido al panel de control de SIGEST Taller</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Zap size={18} className="text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Sistema en línea</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="group relative">
              {/* Glow background */}
              <div className={`absolute inset-0 ${stat.bgColor} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-300`}></div>
              
              {/* Card */}
              <div className={`relative ${stat.bgColor} border border-gray-200/30 rounded-2xl p-6 hover:border-gray-300/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 overflow-hidden`}>
                
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${stat.textColor} opacity-80 mb-2`}>{stat.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className={`text-4xl font-extrabold ${stat.textColor}`}>{stat.value}</h3>
                      <ArrowUp size={16} className={`${stat.textColor} opacity-60`} />
                    </div>
                  </div>
                  <div className={`w-16 h-16 rounded-2xl ${stat.iconBgColor} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={32} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Tabla Últimas Órdenes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-500 text-white flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
                  <p className="text-xs text-gray-500">Últimas 5 órdenes registradas</p>
                </div>
              </div>
              <Link to="/ordenes" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300 text-sm">
                Ver todas →
              </Link>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orden ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vehículo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="flex justify-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      </td>
                    </tr>
                  ) : ultimasOrdenes.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <Target size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No hay órdenes registradas</p>
                      </td>
                    </tr>
                  ) : ultimasOrdenes.map((orden, idx) => (
                    <tr key={orden.id} className={`border-b border-gray-100 hover:bg-blue-50/30 transition-colors duration-200 ${idx === 0 ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-blue-600 text-sm">{orden.id.substring(0, 8)}...</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{orden.clienteNombre || 'Cargando...'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">{orden.vehiculoNombre || 'Desconocido'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(orden.estado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${orden.prioridad === 'URGENTE' ? 'bg-red-100 text-red-700' : orden.prioridad === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {orden.prioridad}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mecánicos */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Equipo Técnico</h3>
                <p className="text-xs text-gray-500">{mecanicosOcupados} activos</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {mecanicosStats.length > 0 ? mecanicosStats.map((m, i) => (
              <div key={i} className="group">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{m.nombre}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      m.porcentajeOcupacion > 80 ? 'bg-red-100 text-red-700' : 
                      m.porcentajeOcupacion > 50 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {m.porcentajeOcupacion}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-sm">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ${
                      m.porcentajeOcupacion > 80 ? 'bg-gradient-to-r from-red-500 to-rose-500' : 
                      m.porcentajeOcupacion > 50 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{width: `${m.porcentajeOcupacion}%`}}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="py-8 text-center">
                <Users size={40} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 text-sm">No hay mecánicos registrados</p>
              </div>
            )}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">💡 Distribución de carga basada en órdenes activas asignadas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

