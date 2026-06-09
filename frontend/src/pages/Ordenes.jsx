import { useEffect, useState } from 'react'
import { Search, Plus, ArrowRight, DollarSign, Clock, ChevronRight, X, User, Car, Wrench, Package, FileText, Calendar, Trash2, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOrdenStore } from '../store/ordenStore'
import { useFacturaStore } from '../store/facturaStore'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export default function Ordenes() {
  const navigate = useNavigate()
  const { ordenes, fetchOrdenes, avanzarEstado, eliminarOrden, loading } = useOrdenStore()
  const { generarFactura } = useFacturaStore()
  const { user } = useAuthStore()
  const [filtro, setFiltro] = useState('')
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [ordenDetalle, setOrdenDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  useEffect(() => {
    fetchOrdenes()
  }, [])

  const handleVerDetalle = async (orden) => {
    setSelectedOrden(orden)
    setLoadingDetalle(true)
    try {
      const res = await api.get(`/ordenes/${orden.id}`)
      setOrdenDetalle(res.data.data)
    } catch {
      setOrdenDetalle(orden)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const handleAvanzar = async (id) => {
    try {
      await avanzarEstado(id)
      fetchOrdenes()
      if (selectedOrden?.id === id) {
        const updated = ordenes.find(o => o.id === id)
        if (updated) setSelectedOrden(updated)
      }
    } catch (error) {
      alert('Error al avanzar el estado: ' + error.message)
    }
  }

  const handleFacturar = async (id) => {
    if (!window.confirm('¿Generar la factura final para esta orden?')) return
    try {
      await generarFactura(id)
      fetchOrdenes()
      setSelectedOrden(null)
    } catch (error) {
      alert('Error al facturar: ' + error.message)
    }
  }

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.')) return
    try {
      await eliminarOrden(id)
      setSelectedOrden(null)
      setOrdenDetalle(null)
      alert('Orden eliminada exitosamente')
    } catch (error) {
      alert('Error al eliminar la orden: ' + error.message)
    }
  }

  const getStatusGradient = (estado) => {
    const gradients = {
      'RECIBIDA':       'from-gray-400 to-gray-600',
      'EN_DIAGNOSTICO': 'from-purple-500 to-purple-700',
      'PRESUPUESTADA':  'from-amber-500 to-orange-600',
      'APROBADA':       'from-blue-500 to-blue-700',
      'EN_REPARACION':  'from-blue-500 to-cyan-600',
      'LISTA':          'from-emerald-500 to-teal-600',
      'ENTREGADA':      'from-slate-700 to-slate-900',
      'FACTURADA':      'from-emerald-600 to-green-700',
      'RECHAZADA':      'from-red-500 to-rose-600',
    }
    return gradients[estado] || 'from-gray-400 to-gray-600'
  }

  const filteredOrdenes = ordenes.filter(o =>
    o.id.toLowerCase().includes(filtro.toLowerCase()) ||
    o.clienteNombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    o.vehiculoNombre?.toLowerCase().includes(filtro.toLowerCase())
  )

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(val) || 0)

  const detalleData = ordenDetalle || selectedOrden

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">Órdenes de Servicio</h1>
          <p className="text-gray-500 mt-1">Gestiona y supervisa todas tus órdenes</p>
        </div>
        <button
          onClick={() => navigate('/ordenes/nueva')}
          className="group relative bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Nueva Orden
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* Lista de órdenes */}
        <div className={`bg-white rounded-2xl shadow-lg border border-gray-200/50 flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${selectedOrden ? 'w-2/5' : 'flex-1'}`}>
          
          {/* Search Header */}
          <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200/50">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                placeholder="Buscar por cliente, vehículo o ID..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>

          {/* Órdenes List */}
          <div className="flex-1 overflow-auto divide-y divide-gray-100">
            {loading && ordenes.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Cargando órdenes...</p>
              </div>
            ) : filteredOrdenes.length === 0 ? (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
                <Search size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron órdenes</h3>
                <p className="text-sm">Crea una nueva orden para comenzar.</p>
              </div>
            ) : (
              filteredOrdenes.map((orden) => (
                <div
                  key={orden.id}
                  onClick={() => handleVerDetalle(orden)}
                  className={`group p-4 cursor-pointer transition-all duration-300 border-l-4 hover:bg-gradient-to-r hover:from-blue-50 to-transparent ${
                    selectedOrden?.id === orden.id 
                      ? `bg-gradient-to-r from-blue-50 to-transparent border-l-blue-600 shadow-lg` 
                      : 'border-l-transparent hover:border-l-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <div className={`bg-gradient-to-r ${getStatusGradient(orden.estado)} text-white px-2.5 py-1 text-[9px] font-bold uppercase rounded-full shadow-sm`}>
                          {orden.estado.replace(/_/g, ' ')}
                        </div>
                        {orden.prioridad === 'URGENTE' && (
                          <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-2.5 py-1 text-[9px] font-bold uppercase rounded-full shadow-sm flex items-center gap-1">
                            <Zap size={10} /> Urgente
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{orden.clienteNombre || 'Sin cliente'}</p>
                      <p className="text-xs text-gray-600 truncate">{orden.vehiculoNombre || 'Sin vehículo'}</p>
                      <div className="flex items-center mt-1.5 text-[11px] text-gray-500">
                        <Calendar size={12} className="mr-1" />
                        {new Date(orden.fechaCreacion).toLocaleDateString('es-DO')}
                      </div>
                    </div>
                    {selectedOrden?.id === orden.id && (
                      <ChevronRight size={18} className="text-blue-600 font-bold flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel de Detalles */}
        {selectedOrden && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/50 flex-1 flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300">
            
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200/50 flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-blue-600 font-mono">{detalleData?.id?.substring(0, 12)}...</p>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent mt-1">{detalleData?.clienteNombre || 'Cargando...'}</h3>
              </div>
              <div className="flex items-center gap-2">
                {detalleData?.estado && (
                  <div className={`bg-gradient-to-r ${getStatusGradient(detalleData.estado)} text-white px-3 py-1 text-[10px] font-bold uppercase rounded-full shadow-md`}>
                    {detalleData.estado.replace(/_/g, ' ')}
                  </div>
                )}
                <button onClick={() => { setSelectedOrden(null); setOrdenDetalle(null) }} className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {loadingDetalle ? (
                <div className="flex justify-center items-center py-12">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/30 rounded-2xl p-5 space-y-3">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Cliente & Vehículo</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0">
                          <User size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 uppercase">Cliente</p>
                          <p className="font-bold text-gray-900 truncate">{detalleData?.clienteNombre || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pt-2 border-t border-blue-200/50">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0">
                          <Car size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 uppercase">Vehículo</p>
                          <p className="font-semibold text-gray-900">{detalleData?.vehiculoNombre || '—'}</p>
                        </div>
                      </div>
                      {detalleData?.mecanicoNombre && (
                        <div className="flex items-start gap-3 pt-2 border-t border-blue-200/50">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center flex-shrink-0">
                            <Wrench size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-gray-600 uppercase">Mecánico</p>
                            <p className="font-semibold text-gray-900">{detalleData.mecanicoNombre}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/30 rounded-2xl p-5 space-y-3">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Fechas & Prioridad</p>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 uppercase">Fecha Creación</p>
                          <p className="font-semibold text-gray-900">{detalleData?.fechaCreacion ? new Date(detalleData.fechaCreacion).toLocaleDateString('es-DO') : '—'}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-amber-200/50">
                        <p className="text-xs text-gray-600 uppercase mb-2">Prioridad</p>
                        <div className={`inline-block px-3 py-1.5 text-xs font-bold uppercase rounded-full ${
                          detalleData?.prioridad === 'URGENTE' ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white' :
                          detalleData?.prioridad === 'VIP' ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                        }`}>
                          {detalleData?.prioridad || 'NORMAL'}
                        </div>
                      </div>
                      {detalleData?.notas && (
                        <div className="pt-3 border-t border-amber-200/50">
                          <p className="text-xs text-gray-600 font-semibold mb-1">Notas</p>
                          <p className="text-sm text-gray-700 italic">"{detalleData.notas}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Servicios */}
                  <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200/50 rounded-2xl p-5">
                    <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                        <Wrench size={16} />
                      </div>
                      Servicios Solicitados
                    </p>
                    {detalleData?.servicios?.length > 0 ? (
                      <div className="space-y-2">
                        {detalleData.servicios.map((s, i) => (
                          <div key={i} className="flex justify-between items-center bg-white border border-gray-200/50 rounded-lg p-3 text-sm hover:shadow-md transition-shadow">
                            <div className="flex-1">
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2.5 py-1 text-[9px] font-bold uppercase rounded inline-block mb-2">
                                {s.tipo}
                              </div>
                              <p className="text-gray-700 font-medium">{s.descripcion}</p>
                            </div>
                            <span className="text-emerald-600 font-bold ml-4 flex-shrink-0">{formatCurrency(s.costo)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-300 text-sm font-bold mt-3">
                          <span className="text-gray-700">Subtotal:</span>
                          <span className="text-lg text-emerald-600">{formatCurrency(detalleData.servicios.reduce((a, s) => a + Number(s.costo), 0))}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No hay servicios registrados</p>
                    )}
                  </div>

                  {/* Repuestos */}
                  {detalleData?.repuestos?.length > 0 && (
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200/50 rounded-2xl p-5">
                      <p className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center">
                          <Package size={16} />
                        </div>
                        Repuestos
                      </p>
                      <div className="space-y-2">
                        {detalleData.repuestos.map((r, i) => (
                          <div key={i} className="flex justify-between items-center bg-white border border-gray-200/50 rounded-lg p-3 text-sm hover:shadow-md transition-shadow">
                            <span className="text-gray-700 font-medium">{r.nombre} × {r.cantidad}</span>
                            <span className="text-emerald-600 font-bold">{formatCurrency(r.precio * r.cantidad)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {detalleData?.estado && detalleData.estado !== 'RECHAZADA' && (
                    <div className="pt-4 border-t border-gray-200 space-y-3">
                      {detalleData.estado === 'FACTURADA' ? (
                        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 text-emerald-700 rounded-xl p-4">
                          <FileText size={24} className="text-emerald-600 flex-shrink-0" />
                          <div>
                            <p className="font-bold">Orden Facturada</p>
                            <p className="text-sm">Cerrada en contabilidad</p>
                          </div>
                        </div>
                      ) : detalleData.estado === 'ENTREGADA' ? (
                        <button
                          onClick={() => handleFacturar(detalleData.id)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <DollarSign size={20} /> Realizar Facturación
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAvanzar(detalleData.id)}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <ArrowRight size={20} /> Avanzar a {siguienteEstado(detalleData.estado)}
                        </button>
                      )}
                      <button
                        onClick={() => handleEliminar(detalleData.id)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Trash2 size={20} /> Eliminar Orden
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function siguienteEstado(actual) {
  const flujo = {
    'RECIBIDA':       'Diagnóstico',
    'EN_DIAGNOSTICO': 'Presupuestada',
    'PRESUPUESTADA':  'Aprobada',
    'APROBADA':       'Reparación',
    'EN_REPARACION':  'Lista',
    'LISTA':          'Entregada',
    'ENTREGADA':      'Facturada'
  }
  return flujo[actual] || 'Siguiente'
}
