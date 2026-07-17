import { useEffect, useState, useMemo } from 'react'
import { Search, Plus, ArrowRight, DollarSign, Clock, ChevronRight, ChevronLeft, X, User, Car, Wrench, Package, FileText, Calendar, Trash2, Zap, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useOrdenStore } from '../store/ordenStore'
import { useFacturaStore } from '../store/facturaStore'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'
import { formatMoneda as formatCurrency } from '../utils/formatMoneda'
import { useToast } from '../components/Toast'
import ConfirmModal from '../components/ConfirmModal'

export default function Ordenes() {
  const navigate = useNavigate()
  const toast = useToast()
  const [confirmConfig, setConfirmConfig] = useState(null)
  const { ordenes, fetchOrdenes, avanzarEstado, eliminarOrden, loading } = useOrdenStore()
  const { generarFactura } = useFacturaStore()
  const { user } = useAuthStore()
  const isAdmin = user?.rol === 'ADMIN'
  const [filtro, setFiltro] = useState('')
  const [selectedOrden, setSelectedOrden] = useState(null)
  const [ordenDetalle, setOrdenDetalle] = useState(null)
  const [loadingDetalle, setLoadingDetalle] = useState(false)

  // DataGrid: sorting & pagination
  const [sortCol, setSortCol]   = useState('fechaCreacion')
  const [sortDir, setSortDir]   = useState('desc')
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 10

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
      await fetchOrdenes()
      // Recargar el detalle del panel para reflejar el nuevo estado
      const updated = ordenes.find(o => o.id === id)
      if (updated) {
        await handleVerDetalle(updated)
      }
      toast.success('Estado actualizado correctamente')
    } catch (error) {
      toast.error('Error al avanzar el estado: ' + error.message)
    }
  }


  const handleFacturar = async (id) => {
    setConfirmConfig({
      title: '¿Generar factura?',
      message: '¿Generar la factura final para esta orden?',
      confirmText: 'Sí, generar factura',
      onConfirm: async () => {
        try {
          await generarFactura(id)
          fetchOrdenes()
          setSelectedOrden(null)
          toast.success('Factura generada exitosamente')
        } catch (error) {
          toast.error('Error al facturar: ' + error.message)
        }
      }
    })
  }

  const handleEliminar = async (id) => {
    setConfirmConfig({
      title: '¿Eliminar orden?',
      message: '¿Estás seguro de que deseas eliminar esta orden? Esta acción no se puede deshacer.',
      danger: true,
      confirmText: 'Sí, eliminar',
      onConfirm: async () => {
        try {
          await eliminarOrden(id)
          setSelectedOrden(null)
          setOrdenDetalle(null)
          toast.success('Orden eliminada exitosamente')
        } catch (error) {
          toast.error('Error al eliminar la orden: ' + error.message)
        }
      }
    })
  }

  const getStatusStyle = (estado) => {
    const styles = {
      'RECIBIDA':       'bg-state-warningBg text-state-warning',
      'EN_DIAGNOSTICO': 'bg-state-infoBg text-state-info',
      'PRESUPUESTADA':  'bg-state-warningBg text-state-warning',
      'APROBADA':       'bg-state-infoBg text-state-info',
      'EN_REPARACION':  'bg-state-infoBg text-state-info',
      'LISTA':          'bg-state-successBg text-state-success',
      'ENTREGADA':      'bg-state-successBg text-state-success',
      'FACTURADA':      'bg-state-successBg text-state-success',
      'RECHAZADA':      'bg-state-dangerBg text-state-danger',
    }
    return styles[estado] || 'bg-gray-100 text-gray-800'
  }

  // Filtrado + ordenamiento + paginación
  const filteredOrdenes = useMemo(() => {
    const q = filtro.toLowerCase()
    const filtered = ordenes.filter(o =>
      o.id.toLowerCase().includes(q) ||
      (o.clienteNombre  || '').toLowerCase().includes(q) ||
      (o.vehiculoNombre || '').toLowerCase().includes(q) ||
      (o.estado         || '').toLowerCase().includes(q)
    )
    filtered.sort((a, b) => {
      let va = a[sortCol] ?? ''
      let vb = b[sortCol] ?? ''
      if (sortCol === 'fechaCreacion') { va = new Date(va); vb = new Date(vb) }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })
    return filtered
  }, [ordenes, filtro, sortCol, sortDir])

  const totalPages   = Math.max(1, Math.ceil(filteredOrdenes.length / PAGE_SIZE))
  const pagedOrdenes = filteredOrdenes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronsUpDown size={13} className="opacity-40" />
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
  }

  const detalleData = ordenDetalle || selectedOrden

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Listado de Órdenes</h2>
          <p className="text-gray-500 mt-1">Gestiona y supervisa todas tus órdenes</p>
        </div>
        <button
          onClick={() => navigate('/ordenes/nueva')}
          className="group relative text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1A7FD4, #0F9D6E)' }}
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Nueva Orden
        </button>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* ── Lista de órdenes (DataGrid profesional) ── */}
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
                placeholder="Buscar por cliente, vehículo, estado o ID..."
                value={filtro}
                onChange={(e) => { setFiltro(e.target.value); setPage(1) }}
              />
            </div>
          </div>

          {/* Encabezados de columna con sorting */}
          <div className="grid grid-cols-[2fr_1fr_1fr] gap-0 px-4 py-2 bg-slate-100 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
            <button onClick={() => handleSort('clienteNombre')} className="flex items-center gap-1 hover:text-blue-600 transition-colors text-left">
              Cliente / Vehículo <SortIcon col="clienteNombre" />
            </button>
            <button onClick={() => handleSort('estado')} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              Estado <SortIcon col="estado" />
            </button>
            <button onClick={() => handleSort('fechaCreacion')} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
              Fecha <SortIcon col="fechaCreacion" />
            </button>
          </div>

          {/* Filas del DataGrid con zebra striping */}
          <div className="flex-1 overflow-auto divide-y divide-gray-100">
            {loading && ordenes.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400">Cargando órdenes...</p>
              </div>
            ) : pagedOrdenes.length === 0 ? (
              <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
                <Search size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron órdenes</h3>
                <p className="text-sm">Crea una nueva orden para comenzar.</p>
              </div>
            ) : (
              pagedOrdenes.map((orden, idx) => (
                <div
                  key={orden.id}
                  onClick={() => handleVerDetalle(orden)}
                  title={`ID: ${orden.id}`}
                  className={`group grid grid-cols-[2fr_1fr_1fr] gap-0 items-center px-4 py-3 cursor-pointer transition-all duration-200 border-l-4 ${
                    selectedOrden?.id === orden.id
                      ? 'bg-blue-50 border-l-blue-600 shadow-inner'
                      : idx % 2 === 0
                        ? 'bg-white border-l-transparent hover:bg-blue-50 hover:border-l-blue-400'
                        : 'bg-slate-50 border-l-transparent hover:bg-blue-50 hover:border-l-blue-400'
                  }`}
                >
                  {/* Col 1: Cliente + Vehículo */}
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">{orden.clienteNombre || 'Sin cliente'}</p>
                    <p className="text-xs text-gray-500 truncate">{orden.vehiculoNombre || 'Sin vehículo'}</p>
                    {orden.prioridad === 'URGENTE' && (
                      <span className="inline-flex items-center gap-0.5 mt-1 bg-state-dangerBg text-state-danger px-1.5 py-0.5 text-[9px] font-bold uppercase rounded">
                        <Zap size={9} /> Urgente
                      </span>
                    )}
                    {orden.prioridad === 'VIP' && (
                      <span className="inline-flex items-center gap-0.5 mt-1 bg-state-warningBg text-state-warning px-1.5 py-0.5 text-[9px] font-bold uppercase rounded">
                        ⭐ VIP
                      </span>
                    )}
                  </div>

                  {/* Col 2: Estado */}
                  <div>
                    <span className={`inline-block ${getStatusStyle(orden.estado)} px-2 py-0.5 text-[9px] font-bold uppercase rounded-full shadow-sm whitespace-nowrap`}>
                      {orden.estado.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Col 3: Fecha */}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={11} className="flex-shrink-0" />
                    {new Date(orden.fechaCreacion).toLocaleDateString('es-DO')}
                    {selectedOrden?.id === orden.id && (
                      <ChevronRight size={14} className="text-blue-600 ml-auto flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie de paginación */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-gray-200 text-xs text-gray-500">
            <span>{filteredOrdenes.length} orden{filteredOrdenes.length !== 1 ? 'es' : ''} · pág. {page} de {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`w-6 h-6 rounded-md text-[11px] font-semibold transition-colors ${
                      pg === page ? 'bg-brand-primary text-white' : 'hover:bg-gray-200 text-gray-600'
                    }`}
                  >{pg}</button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
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
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full shadow-sm ${getStatusStyle(detalleData.estado)}`}>
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
                          detalleData?.prioridad === 'URGENTE' ? 'bg-state-dangerBg text-state-danger' :
                          detalleData?.prioridad === 'VIP' ? 'bg-state-warningBg text-state-warning' : 'bg-slate-100 text-slate-600'
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
                          className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #1A7FD4, #0F9D6E)' }}
                        >
                          <DollarSign size={20} /> Realizar Facturación
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAvanzar(detalleData.id)}
                          className="w-full flex items-center justify-center gap-2 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          style={{ background: 'linear-gradient(135deg, #1A7FD4, #0F9D6E)' }}
                        >
                          <ArrowRight size={20} /> Avanzar a {siguienteEstado(detalleData.estado)}
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => handleEliminar(detalleData.id)}
                          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Trash2 size={20} /> Eliminar Orden
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
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
