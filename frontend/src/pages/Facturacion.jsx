import { useEffect, useState } from 'react'
import { FileText, Search, Printer, DollarSign, Calendar, Hash, Trash2, Edit, AlertTriangle, X, Save, CheckCircle2, ChevronRight, Receipt, Percent } from 'lucide-react'
import { useFacturaStore } from '../store/facturaStore'
import { useOrdenStore } from '../store/ordenStore'
import { useAuthStore } from '../store/authStore'
import { formatMoneda as formatCurrency } from '../utils/formatMoneda'
import { useToast } from '../components/Toast'

export default function Facturacion() {
  const { facturas, fetchFacturas, loading: loadingFacturas, deleteFactura, updateFactura, generarFactura } = useFacturaStore()
  const { ordenes, fetchOrdenes, loading: loadingOrdenes } = useOrdenStore()
  const { user } = useAuthStore()
  const isAdmin = user?.rol === 'ADMIN'
  const isCajeroOrAdmin = user?.rol === 'ADMIN' || user?.rol === 'CAJERO'
  const toast = useToast()

  const [activeTab, setActiveTab] = useState('historial') // 'historial' | 'pendientes'
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modales y formularios
  const [editingFactura, setEditingFactura] = useState(null)
  const [editForm, setEditForm] = useState({ descuento: 0, descripDescuento: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [facturarOrden, setFacturarOrden] = useState(null)
  const [descuentoManual, setDescuentoManual] = useState(0)
  const [descripDescuento, setDescripDescuento] = useState('')

  useEffect(() => {
    fetchFacturas()
    fetchOrdenes({ estado: 'ENTREGADA' })
  }, [])

  const totalHoy = facturas
    .filter(f => new Date(f.fechaEmision).toDateString() === new Date().toDateString())
    .reduce((acc, f) => acc + Number(f.total), 0)

  const totalGeneral = facturas.reduce((acc, f) => acc + Number(f.total), 0)

  const filteredFacturas = facturas.filter(f =>
    f.orden?.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ordenId?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredPendientes = ordenes.filter(o =>
    o.clienteNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vehiculoNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenEdit = (f) => {
    setEditingFactura(f)
    setEditForm({
      descuento: Number(f.descuento) || 0,
      descripDescuento: f.descripDescuento || ''
    })
  }

  const handleSaveEdit = async () => {
    try {
      await updateFactura(editingFactura.id, editForm)
      setEditingFactura(null)
      fetchFacturas()
      toast.success('Factura actualizada correctamente')
    } catch {
      toast.error('Error al actualizar la factura')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteFactura(id)
      setConfirmDelete(null)
      // Recargar historial y pendientes tras eliminar
      await fetchFacturas()
      await fetchOrdenes({ estado: 'ENTREGADA' })
      toast.success('Factura eliminada correctamente')
    } catch {
      toast.error('Error al eliminar la factura')
    }
  }

  const handleOpenFacturar = (orden) => {
    setFacturarOrden(orden)
    // Inicializar descuento
    // Si el cliente es frecuente, sugerimos un 10%
    const subtotalServicios = orden.servicios?.reduce((acc, s) => acc + Number(s.costo), 0) || 0
    const subtotalRepuestos = orden.repuestos?.reduce((acc, r) => acc + (Number(r.precio) * r.cantidad), 0) || 0
    const subtotal = subtotalServicios + subtotalRepuestos
    if (orden.cliente?.esFrecuente) {
      setDescuentoManual(parseFloat((subtotal * 0.10).toFixed(2)))
      setDescripDescuento('Descuento de Cliente Frecuente (10%)')
    } else {
      setDescuentoManual(0)
      setDescripDescuento('')
    }
  }

  const handleCrearFactura = async () => {
    try {
      await generarFactura(facturarOrden.id, {
        descuento: descuentoManual,
        descripDescuento: descripDescuento
      })
      setFacturarOrden(null)
      // Esperar el refresco del historial antes de cambiar de pestaña
      await fetchFacturas()
      await fetchOrdenes({ estado: 'ENTREGADA' })
      // Cambiar automáticamente al historial para que el usuario vea la nueva factura
      setActiveTab('historial')
      toast.success('Factura generada exitosamente')
    } catch (error) {
      toast.error('Error al generar la factura: ' + error.message)
    }
  }

  // Cálculos en tiempo real
  const calcResumenFactura = (orden) => {
    if (!orden) return { subtotal: 0, descuento: 0, baseImponible: 0, itbis: 0, total: 0 }
    const subtotalServicios = orden.servicios?.reduce((acc, s) => acc + Number(s.costo), 0) || 0
    const subtotalRepuestos = orden.repuestos?.reduce((acc, r) => acc + (Number(r.precio) * r.cantidad), 0) || 0
    const subtotal = subtotalServicios + subtotalRepuestos
    const descuento = Number(descuentoManual) || 0
    const baseImponible = Math.max(0, subtotal - descuento)
    const itbis = parseFloat((baseImponible * 0.18).toFixed(2))
    const total = parseFloat((baseImponible + itbis).toFixed(2))
    return { subtotal, descuento, baseImponible, itbis, total }
  }

  const calcResumenEdicion = () => {
    if (!editingFactura) return { subtotal: 0, descuento: 0, baseImponible: 0, itbis: 0, total: 0 }
    const subtotal = Number(editingFactura.subtotal) || 0
    const descuento = Number(editForm.descuento) || 0
    const baseImponible = Math.max(0, subtotal - descuento)
    const itbis = parseFloat((baseImponible * 0.18).toFixed(2))
    const total = parseFloat((baseImponible + itbis).toFixed(2))
    return { subtotal, descuento, baseImponible, itbis, total }
  }

  const resumenNueva = calcResumenFactura(facturarOrden)
  const resumenEdit = calcResumenEdicion()

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Facturación</h2>
          <p className="text-gray-500 mt-1 font-medium">Historial, emisión de comprobantes y caja del taller mecánico</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 text-white group hover:shadow-2xl transition-all duration-300 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-75 uppercase tracking-wider">Histórico de Ventas</p>
              <p className="text-3xl font-extrabold mt-2 tracking-tight">{formatCurrency(totalGeneral)}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-3xl text-emerald-400">
              <Receipt />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-xl p-6 text-white group hover:shadow-2xl transition-all duration-300 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-90 uppercase tracking-wider">Ingresos de Hoy</p>
              <p className="text-3xl font-extrabold mt-2 tracking-tight">{formatCurrency(totalHoy)}</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
              <DollarSign />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('historial')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all duration-200 flex items-center gap-2 ${
            activeTab === 'historial'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={16} /> Historial de Facturas
          <span className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full font-semibold">
            {filteredFacturas.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('pendientes')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-all duration-200 flex items-center gap-2 relative ${
            activeTab === 'pendientes'
              ? 'border-emerald-500 text-emerald-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Receipt size={16} /> Órdenes por Facturar
          {filteredPendientes.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs py-0.5 px-2 rounded-full font-bold animate-pulse">
              {filteredPendientes.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 flex-1 flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
        
        {/* Search Header */}
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200/50 flex justify-between items-center gap-4 flex-wrap">
          <div className="relative group flex-1 min-w-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all duration-300"
              placeholder={activeTab === 'historial' ? "Buscar por cliente o ID..." : "Buscar orden por cliente o vehículo..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'historial' && (
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
            >
              <Printer size={16} /> Imprimir Reporte
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activeTab === 'historial' ? (
            loadingFacturas ? (
              <div className="p-20 text-center text-gray-400 italic">Cargando facturas...</div>
            ) : filteredFacturas.length === 0 ? (
              <div className="p-20 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                  <FileText size={24} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Sin facturas emitidas</h3>
                <p className="text-sm">Las facturas generadas a partir de órdenes completadas aparecerán aquí.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Factura / Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Cliente / Vehículo</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Subtotal</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Descuento</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">ITBIS 18%</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                    {(isAdmin || isCajeroOrAdmin) && <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredFacturas.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-2 bg-emerald-50 text-emerald-600 rounded mr-3 shadow-sm">
                            <Hash size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">FAC-{f.id.substring(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]" title={f.ordenId}>OS: {f.ordenId.substring(0, 15)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{f.orden?.cliente?.nombre || '—'}</p>
                        <p className="text-xs text-gray-500">{f.orden?.vehiculo?.marca} {f.orden?.vehiculo?.modelo} {f.orden?.vehiculo?.placa ? `(${f.orden?.vehiculo?.placa})` : ''}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar size={12} className="mr-1.5" />
                          {new Date(f.fechaEmision).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {formatCurrency(f.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-amber-600 font-medium">
                        {Number(f.descuento) > 0 ? `-${formatCurrency(f.descuento)}` : '—'}
                        {f.descripDescuento && <p className="text-[10px] text-gray-400 italic truncate max-w-[130px] ml-auto" title={f.descripDescuento}>{f.descripDescuento}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {formatCurrency(f.itbis)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-emerald-600 text-base">
                        {formatCurrency(f.total)}
                      </td>
                      {(isAdmin || isCajeroOrAdmin) && (
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenEdit(f)}
                                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                title="Ajustar descuento (Editar)"
                              >
                                <Edit size={16} />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => setConfirmDelete(f)}
                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                title="Eliminar factura"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            // Pestaña de Órdenes por Facturar
            loadingOrdenes ? (
              <div className="p-20 text-center text-gray-400 italic">Cargando órdenes pendientes...</div>
            ) : filteredPendientes.length === 0 ? (
              <div className="p-20 text-center text-gray-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-4 text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">¡Todo al día!</h3>
                <p className="text-sm">No existen órdenes en estado "Entregada" pendientes de facturación.</p>
              </div>
            ) : (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPendientes.map((orden) => {
                  const totalServicios = orden.servicios?.reduce((acc, s) => acc + Number(s.costo), 0) || 0
                  const totalRepuestos = orden.repuestos?.reduce((acc, r) => acc + (Number(r.precio) * r.cantidad), 0) || 0
                  const subtotal = totalServicios + totalRepuestos

                  return (
                    <div 
                      key={orden.id} 
                      className="border border-gray-200 rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-bold font-mono uppercase">
                              OS: {orden.id.substring(0, 12)}...
                            </span>
                            <h4 className="text-lg font-bold text-gray-900 mt-2">{orden.clienteNombre || 'Sin Cliente'}</h4>
                          </div>
                          {orden.cliente?.esFrecuente && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1">
                              <Percent size={10} /> Frecuente
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Vehículo:</strong> {orden.vehiculoNombre || '—'}</p>
                          <p><strong>Servicios:</strong> {orden.servicios?.length || 0}</p>
                          <p><strong>Repuestos:</strong> {orden.repuestos?.length || 0}</p>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">Subtotal Estimado</p>
                            <p className="text-lg font-extrabold text-gray-800">{formatCurrency(subtotal)}</p>
                          </div>
                        </div>
                      </div>

                      {isCajeroOrAdmin && (
                        <button
                          onClick={() => handleOpenFacturar(orden)}
                          className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
                        >
                          <DollarSign size={16} /> Facturar Orden
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal: Generar Factura */}
      {facturarOrden && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Generar Factura Final</h3>
                <p className="text-xs text-gray-500">Orden: {facturarOrden.id}</p>
              </div>
              <button onClick={() => setFacturarOrden(null)} className="text-gray-400 hover:text-gray-700 p-1.5 hover:bg-white rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-gray-700 border border-slate-200/50 space-y-2">
                <p><strong>Cliente:</strong> {facturarOrden.clienteNombre}</p>
                <p><strong>Vehículo:</strong> {facturarOrden.vehiculoNombre}</p>
                {facturarOrden.cliente?.esFrecuente && (
                  <p className="text-emerald-700 font-semibold flex items-center gap-1 text-xs">
                    <CheckCircle2 size={14} /> Aplica 10% Descuento Automático Cliente Frecuente
                  </p>
                )}
              </div>

              {/* Formulario de Descuento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Descuento (RD$)</label>
                  <input
                    type="number" 
                    min="0" 
                    max={resumenNueva.subtotal}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    value={descuentoManual}
                    onChange={e => setDescuentoManual(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Motivo Descuento</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Ej. Promoción, Frecuente..."
                    value={descripDescuento}
                    onChange={e => setDescripDescuento(e.target.value)}
                  />
                </div>
              </div>

              {/* Resumen Financiero en Vivo */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Desglose de Totales (RD$)</p>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(resumenNueva.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Descuento aplicado:</span>
                  <span className="font-semibold">-{formatCurrency(resumenNueva.descuento)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 border-t border-dashed border-gray-100 pt-2">
                  <span>Base Imponible:</span>
                  <span className="font-semibold">{formatCurrency(resumenNueva.baseImponible)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>ITBIS (18%):</span>
                  <span className="font-semibold">{formatCurrency(resumenNueva.itbis)}</span>
                </div>
                <div className="flex justify-between text-lg text-emerald-600 font-extrabold pt-2 border-t border-gray-200">
                  <span>Total a Pagar:</span>
                  <span>{formatCurrency(resumenNueva.total)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-6 border-t border-gray-100 bg-slate-50">
              <button onClick={() => setFacturarOrden(null)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors">
                Cancelar
              </button>
              <button 
                onClick={handleCrearFactura} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl shadow-md hover:shadow-lg transition-colors flex items-center gap-1.5"
              >
                <DollarSign size={16} /> Procesar Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Factura (Descuento) */}
      {editingFactura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-gray-900">Editar Descuento de Factura</h3>
              <button onClick={() => setEditingFactura(null)} className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-gray-600 border border-slate-200/50 space-y-1">
                <p><strong>Factura:</strong> FAC-{editingFactura.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Cliente:</strong> {editingFactura.orden?.cliente?.nombre}</p>
                <p><strong>Subtotal Original:</strong> {formatCurrency(editingFactura.subtotal)}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Descuento (RD$)</label>
                <input
                  type="number" 
                  min="0" 
                  max={editingFactura.subtotal}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  value={editForm.descuento}
                  onChange={e => setEditForm({...editForm, descuento: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Motivo del Ajuste</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Ej: Cliente frecuente, error..."
                  value={editForm.descripDescuento}
                  onChange={e => setEditForm({...editForm, descripDescuento: e.target.value})}
                />
              </div>

              {/* Resumen en vivo */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Nuevo Descuento:</span>
                  <span className="font-semibold text-amber-600">-{formatCurrency(resumenEdit.descuento)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Nuevo ITBIS (18%):</span>
                  <span className="font-semibold">{formatCurrency(resumenEdit.itbis)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-blue-600 pt-1.5 border-t border-dashed border-gray-100">
                  <span>Nuevo Total Recalculado:</span>
                  <span>{formatCurrency(resumenEdit.total)}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-100 bg-slate-50">
              <button onClick={() => setEditingFactura(null)} className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-xl shadow-md transition-colors flex items-center gap-1.5">
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4 text-red-500">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar factura?</h3>
            <p className="text-sm text-gray-500 mb-1">
              Esta acción <strong>deshace la facturación</strong>.
            </p>
            <p className="text-xs text-amber-600 font-semibold mb-3">
              Nota: La orden volverá al estado "Entregada" para poder facturarse nuevamente.
            </p>
            <p className="text-sm font-extrabold text-gray-800 mb-6 bg-slate-100 py-2.5 rounded-lg">
              FAC-{confirmDelete.id.substring(0, 8).toUpperCase()} — {confirmDelete.orden?.cliente?.nombre}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-5 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors flex-1">Cancelar</button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-xl shadow-md transition-colors flex-1"
                disabled={loadingFacturas}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
