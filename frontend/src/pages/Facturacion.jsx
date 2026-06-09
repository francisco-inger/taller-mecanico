import { useEffect, useState } from 'react'
import { FileText, Search, Printer, DollarSign, Calendar, Hash, Trash2, Edit, AlertTriangle, X, Save } from 'lucide-react'
import { useFacturaStore } from '../store/facturaStore'
import { useAuthStore } from '../store/authStore'

export default function Facturacion() {
  const { facturas, fetchFacturas, loading, deleteFactura, updateFactura } = useFacturaStore()
  const { user } = useAuthStore()
  const isAdmin = user?.rol === 'ADMIN'

  const [searchTerm, setSearchTerm] = useState('')
  const [editingFactura, setEditingFactura] = useState(null)
  const [editForm, setEditForm] = useState({ descuento: 0, descripDescuento: '' })
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    fetchFacturas()
  }, [])

  const totalHoy = facturas
    .filter(f => new Date(f.fechaEmision).toDateString() === new Date().toDateString())
    .reduce((acc, f) => acc + Number(f.total), 0)

  const totalGeneral = facturas.reduce((acc, f) => acc + Number(f.total), 0)

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(Number(val) || 0)

  const filteredFacturas = facturas.filter(f =>
    f.orden?.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.ordenId?.toLowerCase().includes(searchTerm.toLowerCase())
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
    } catch {
      alert('Error al actualizar la factura')
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteFactura(id)
      setConfirmDelete(null)
    } catch {
      alert('Error al eliminar la factura')
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Facturación & Caja</h1>
          <p className="text-gray-500 mt-1">Historial y gestión de pagos del taller</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white group hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Total Facturas</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalGeneral)}</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
              <FileText />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white group hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold opacity-80 uppercase tracking-wider">Ingresos Hoy</p>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalHoy)}</p>
            </div>
            <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-3xl">
              <DollarSign />
            </div>
          </div>
        </div>
      </div>

      {/* Facturas Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 flex-1 flex flex-col overflow-hidden hover:shadow-xl transition-shadow">
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200/50 flex justify-between items-center gap-4 flex-wrap">
          <div className="relative group flex-1 min-w-xs">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-500 transition-colors">
              <Search size={20} />
            </div>
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 transition-all duration-300"
              placeholder="Buscar por cliente o ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => window.print()} 
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 text-sm"
          >
            <Printer size={16} /> Imprimir
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-20 text-center text-gray-400 italic">Cargando facturas...</div>
          ) : filteredFacturas.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <FileText size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Sin facturas</h3>
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
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">ITBIS 18%</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                  {isAdmin && <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Opciones</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredFacturas.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded mr-3">
                          <Hash size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">FAC-{f.id.substring(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{f.ordenId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{f.orden?.cliente?.nombre || '—'}</p>
                      <p className="text-xs text-gray-500">{f.orden?.vehiculo?.marca} {f.orden?.vehiculo?.modelo}</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                      {formatCurrency(f.itbis)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 text-base">
                      {formatCurrency(f.total)}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(f)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                            title="Editar factura"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(f)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Eliminar factura"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {editingFactura && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Editar Factura</h3>
              <button onClick={() => setEditingFactura(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p><strong>Factura:</strong> FAC-{editingFactura.id.substring(0, 8).toUpperCase()}</p>
                <p><strong>Cliente:</strong> {editingFactura.orden?.cliente?.nombre}</p>
                <p><strong>Total actual:</strong> {formatCurrency(editingFactura.total)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Descuento adicional (RD$)</label>
                <input
                  type="number" min="0" step="0.01"
                  className="input-field"
                  value={editForm.descuento}
                  onChange={e => setEditForm({...editForm, descuento: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Motivo del ajuste</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ej: Cliente frecuente, error de digitación..."
                  value={editForm.descripDescuento}
                  onChange={e => setEditForm({...editForm, descripDescuento: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-6 border-t border-gray-100">
              <button onClick={() => setEditingFactura(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} className="btn-primary flex items-center" disabled={loading}>
                <Save size={16} className="mr-2" /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">¿Eliminar factura?</h3>
            <p className="text-sm text-gray-500 mb-2">
              Esta acción <strong>no se puede deshacer</strong>.
            </p>
            <p className="text-sm font-semibold text-gray-700 mb-6">
              FAC-{confirmDelete.id.substring(0, 8).toUpperCase()} — {confirmDelete.orden?.cliente?.nombre}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary px-6">Cancelar</button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-xl hover:bg-red-700 transition-colors"
                disabled={loading}
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
