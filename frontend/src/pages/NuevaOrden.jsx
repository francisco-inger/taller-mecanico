import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Save, User, Car, Wrench, X, AlertCircle, Plus, Check,
  ChevronLeft, ChevronRight, ClipboardList
} from 'lucide-react'
import { useClienteStore } from '../store/clienteStore'
import { useVehiculoStore } from '../store/vehiculoStore'
import { useOrdenStore } from '../store/ordenStore'
import { useMecanicoStore } from '../store/mecanicoStore'
import { useToast } from '../components/Toast'
import api from '../api/axios'

/* ─── Wizard config ─────────────────────────────────────── */
const PASOS = [
  { id: 1, titulo: 'Cliente y Vehículo', icono: User,          desc: 'Selecciona el cliente y el vehículo' },
  { id: 2, titulo: 'Servicios',          icono: Wrench,         desc: 'Agrega los servicios a realizar'    },
  { id: 3, titulo: 'Resumen',            icono: ClipboardList,  desc: 'Revisa y confirma la orden'         },
]

/* ─── Barra de progreso ──────────────────────────────────── */
function BarraProgreso({ pasoActual }) {
  return (
    <div className="relative flex items-center justify-between mb-10">
      {/* línea de fondo */}
      <div className="absolute inset-x-0 top-5 h-0.5 bg-gray-200 z-0" />
      {/* línea de progreso */}
      <div
        className="absolute top-5 h-0.5 bg-gradient-to-r from-[#0F9D6E] to-[#1A7FD4] z-0 transition-all duration-500"
        style={{ left: 0, width: `${((pasoActual - 1) / (PASOS.length - 1)) * 100}%` }}
      />
      {PASOS.map((p) => {
        const completado = pasoActual > p.id
        const activo     = pasoActual === p.id
        const Icono      = p.icono
        return (
          <div key={p.id} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              completado ? 'bg-state-success border-state-success text-white shadow-lg shadow-emerald-200'
              : activo   ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-blue-200 scale-110'
              :             'bg-white border-gray-300 text-gray-400'
            }`}>
              {completado ? <Check size={18} strokeWidth={3} /> : <Icono size={17} />}
            </div>
            <div className="text-center">
              <p className={`text-xs font-bold transition-colors ${activo ? 'text-brand-primary' : completado ? 'text-state-success' : 'text-gray-400'}`}>
                {p.titulo}
              </p>
              <p className="text-[10px] text-gray-400 hidden sm:block">{p.desc}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────── */
export default function NuevaOrden() {
  const navigate = useNavigate()
  const toast    = useToast()
  const { clientes, fetchClientes }                            = useClienteStore()
  const { vehiculos, fetchVehiculosPorCliente, loading: loadingVehiculos } = useVehiculoStore()
  const { crearOrden, loading: creatingOrden }                 = useOrdenStore()
  const { mecanicos, fetchMecanicos }                          = useMecanicoStore()

  const [paso, setPaso] = useState(1)
  const [erroresPaso, setErroresPaso] = useState('')

  const [formData, setFormData] = useState({
    clienteId: '', vehiculoId: '', mecanicoId: '',
    servicios: [], notas: '', prioridad: 'NORMAL'
  })

  const [servicioActual, setServicioActual] = useState({
    tipo: 'mantenimiento', descripcion: '', costo: 0, tiempoEstimado: 30
  })
  const [horasServicio, setHorasServicio] = useState('0')
  const [minutosServicio, setMinutosServicio] = useState('30')

  const [mostrarFormVehiculo, setMostrarFormVehiculo] = useState(false)
  const [nuevoVehiculo, setNuevoVehiculo]             = useState({
    marca: '', modelo: '', anio: '', placa: '', color: '', kilometraje: ''
  })
  const [guardandoVehiculo, setGuardandoVehiculo] = useState(false)
  const [errorVehiculo, setErrorVehiculo]         = useState('')

  useEffect(() => { fetchClientes(); fetchMecanicos() }, [])

  useEffect(() => {
    if (formData.clienteId) {
      fetchVehiculosPorCliente(formData.clienteId)
      setFormData(prev => ({ ...prev, vehiculoId: '' }))
      setMostrarFormVehiculo(false)
    }
  }, [formData.clienteId])

  /* ── Validación por paso ─── */
  const validarPaso = () => {
    if (paso === 1) {
      if (!formData.clienteId)  { setErroresPaso('Selecciona un cliente.'); return false }
      if (!formData.vehiculoId && !mostrarFormVehiculo) { setErroresPaso('Selecciona o registra un vehículo.'); return false }
    }
    if (paso === 2) {
      if (formData.servicios.length === 0) { setErroresPaso('Agrega al menos un servicio.'); return false }
    }
    setErroresPaso('')
    return true
  }

  const irSiguiente = () => { if (validarPaso()) setPaso(p => p + 1) }
  const irAnterior  = () => { setErroresPaso(''); setPaso(p => p - 1) }

  /* ── Servicios ─── */
  const handleAddServicio = () => {
    if (!servicioActual.descripcion.trim()) { setErroresPaso('Escribe una descripción del servicio.'); return }
    const h = parseInt(horasServicio) || 0
    const m = parseInt(minutosServicio) || 0
    const totalMinutos = (h * 60) + m
    if (totalMinutos <= 0) { setErroresPaso('El tiempo estimado debe ser mayor a 0.'); return }

    setFormData(prev => ({
      ...prev,
      servicios: [...prev.servicios, { ...servicioActual, tiempoEstimado: totalMinutos }]
    }))
    setServicioActual({ tipo: 'mantenimiento', descripcion: '', costo: 0, tiempoEstimado: 30 })
    setHorasServicio('0')
    setMinutosServicio('30')
    setErroresPaso('')
  }

  const handleRemoveServicio = (idx) => {
    setFormData(prev => ({ ...prev, servicios: prev.servicios.filter((_, i) => i !== idx) }))
  }

  /* ── Guardar vehículo inline ─── */
  const handleGuardarVehiculo = async () => {
    setGuardandoVehiculo(true); setErrorVehiculo('')
    try {
      const res = await api.post('/vehiculos', { ...nuevoVehiculo, clienteId: formData.clienteId })
      await fetchVehiculosPorCliente(formData.clienteId)
      setFormData(prev => ({ ...prev, vehiculoId: res.data.data.id }))
      setMostrarFormVehiculo(false)
      setNuevoVehiculo({ marca: '', modelo: '', anio: '', placa: '', color: '', kilometraje: '' })
      toast.success('Vehículo registrado correctamente')
    } catch (err) {
      setErrorVehiculo(err.response?.data?.message || 'Error al guardar el vehículo.')
    } finally {
      setGuardandoVehiculo(false)
    }
  }

  /* ── Envío final ─── */
  const handleSubmit = async () => {
    try {
      await crearOrden(formData)
      toast.success('Orden de servicio creada exitosamente ✅')
      navigate('/ordenes')
    } catch (error) {
      toast.error('Error al crear la orden: ' + (error.message || 'Error desconocido'))
    }
  }

  /* ── Helpers de display ─── */
  const clienteSeleccionado  = clientes.find(c => c.id === formData.clienteId)
  const vehiculoSeleccionado = vehiculos.find(v => v.id === formData.vehiculoId)
  const mecanicoSeleccionado = mecanicos.find(m => m.id === formData.mecanicoId)
  const totalServicios       = formData.servicios.reduce((a, s) => a + Number(s.costo), 0)

  const PRIORIDAD_LABEL = { NORMAL: '🔵 Normal', URGENTE: '🔴 Urgente', VIP: '⭐ VIP' }

  return (
    <div className="max-w-3xl mx-auto pb-16">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Nueva Orden de Servicio</h2>
          <p className="text-sm text-gray-500 mt-0.5">Paso {paso} de {PASOS.length}</p>
        </div>
        <button
          className="text-sm font-medium text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
          onClick={() => navigate('/ordenes')}
        >
          <X size={15} /> Cancelar
        </button>
      </div>

      {/* Barra de progreso */}
      <BarraProgreso pasoActual={paso} />

      {/* Panel del paso */}
      <div className="card p-6 md:p-8">

        {/* Error de validación */}
        {erroresPaso && (
          <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertCircle size={16} className="flex-shrink-0" /> {erroresPaso}
          </div>
        )}

        {/* ─── PASO 1: Cliente y Vehículo ─────────────────── */}
        {paso === 1 && (
          <div className="space-y-6">
            <SectionTitle icono={User} titulo="Información del Cliente" />

            {/* Cliente */}
            <div className="space-y-2">
              <label className="label-field">Cliente *</label>
              <select
                className="input-field bg-white"
                value={formData.clienteId}
                onChange={e => setFormData({ ...formData, clienteId: e.target.value })}
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — {c.cedula}</option>
                ))}
              </select>
            </div>

            {/* Vehículo */}
            {formData.clienteId && (
              <div className="space-y-3">
                <SectionTitle icono={Car} titulo="Vehículo" />
                <select
                  className="input-field bg-white"
                  value={formData.vehiculoId}
                  onChange={e => setFormData({ ...formData, vehiculoId: e.target.value })}
                  disabled={loadingVehiculos}
                >
                  <option value="">{loadingVehiculos ? 'Cargando...' : 'Seleccione un vehículo...'}</option>
                  {vehiculos.map(v => (
                    <option key={v.id} value={v.id}>{v.marca} {v.modelo} — {v.placa}</option>
                  ))}
                </select>

                {!loadingVehiculos && vehiculos.length === 0 && !mostrarFormVehiculo && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-700 flex items-center gap-1">
                      <AlertCircle size={13} /> Este cliente no tiene vehículos registrados.
                    </p>
                    <button type="button" onClick={() => setMostrarFormVehiculo(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      <Plus size={13} /> Agregar
                    </button>
                  </div>
                )}

                {!loadingVehiculos && vehiculos.length > 0 && !mostrarFormVehiculo && (
                  <button type="button" onClick={() => setMostrarFormVehiculo(true)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <Plus size={13} /> Registrar nuevo vehículo
                  </button>
                )}

                {/* Mini-form nuevo vehículo */}
                {mostrarFormVehiculo && (
                  <div className="border border-blue-200 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-blue-50">
                      <span className="text-sm font-semibold text-blue-700 flex items-center gap-2">
                        <Car size={15} /> Registrar Nuevo Vehículo
                      </span>
                      <button type="button" onClick={() => setMostrarFormVehiculo(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-4 space-y-4 bg-white">
                      {errorVehiculo && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                          <AlertCircle size={12} /> {errorVehiculo}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <InputField label="Marca *" placeholder="Toyota..." value={nuevoVehiculo.marca}
                          onChange={v => setNuevoVehiculo({ ...nuevoVehiculo, marca: v })} />
                        <InputField label="Modelo *" placeholder="Corolla..." value={nuevoVehiculo.modelo}
                          onChange={v => setNuevoVehiculo({ ...nuevoVehiculo, modelo: v })} />
                        <InputField label="Año *" type="number" placeholder="2020" value={nuevoVehiculo.anio}
                          onChange={v => setNuevoVehiculo({ ...nuevoVehiculo, anio: v })} />
                        <InputField label="Placa *" placeholder="A123456" value={nuevoVehiculo.placa}
                          onChange={v => setNuevoVehiculo({ ...nuevoVehiculo, placa: v })} />
                        <InputField label="Color" placeholder="Blanco" value={nuevoVehiculo.color}
                          onChange={v => setNuevoVehiculo({ ...nuevoVehiculo, color: v })} />
                        <InputField label="Kilometraje" type="number" placeholder="45000" value={nuevoVehiculo.kilometraje}
                          onChange={v => setNuevoVehiculo({ ...nuevoVehiculo, kilometraje: v })} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setMostrarFormVehiculo(false)} className="btn-secondary text-sm">Cancelar</button>
                        <button type="button" onClick={handleGuardarVehiculo} disabled={guardandoVehiculo}
                          className="btn-primary text-sm flex items-center gap-2">
                          {guardandoVehiculo
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Save size={14} />}
                          Guardar Vehículo
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Prioridad y Mecánico */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="label-field">Prioridad</label>
                <select className="input-field" value={formData.prioridad}
                  onChange={e => setFormData({ ...formData, prioridad: e.target.value })}>
                  <option value="NORMAL">🔵 Normal</option>
                  <option value="URGENTE">🔴 Urgente</option>
                  <option value="VIP">⭐ VIP</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="label-field">Mecánico (Opcional)</label>
                <select className="input-field bg-white" value={formData.mecanicoId}
                  onChange={e => setFormData({ ...formData, mecanicoId: e.target.value })}>
                  <option value="">Sin asignar por ahora...</option>
                  {mecanicos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre} — {m.especialidad}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ─── PASO 2: Servicios ───────────────────────────── */}
        {paso === 2 && (
          <div className="space-y-6">
            <SectionTitle icono={Wrench} titulo="Servicios a Realizar" />

            {/* Form de servicio */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="label-field">Tipo</label>
                  <select className="input-field" value={servicioActual.tipo}
                    onChange={e => setServicioActual({ ...servicioActual, tipo: e.target.value })}>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="reparacion">Reparación</option>
                    <option value="diagnostico">Diagnóstico</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="label-field">Costo (RD$)</label>
                  <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00"
                    value={servicioActual.costo || ''}
                    onChange={e => setServicioActual({ ...servicioActual, costo: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="space-y-1">
                  <label className="label-field block text-sm font-medium text-gray-700 mb-1">Tiempo Estimado</label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="w-12 bg-transparent text-center border-none p-0 focus:ring-0 focus:outline-none text-gray-800 font-semibold"
                        value={horasServicio}
                        onChange={e => setHorasServicio(e.target.value)}
                      />
                      <span className="text-xs text-gray-400 font-medium">h</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-200">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="30"
                        className="w-12 bg-transparent text-center border-none p-0 focus:ring-0 focus:outline-none text-gray-800 font-semibold"
                        value={minutosServicio}
                        onChange={e => setMinutosServicio(e.target.value)}
                      />
                      <span className="text-xs text-gray-400 font-medium">m</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <input type="text" className="input-field flex-1" placeholder="Descripción del servicio..."
                  value={servicioActual.descripcion}
                  onChange={e => setServicioActual({ ...servicioActual, descripcion: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddServicio())} />
                <button type="button" onClick={handleAddServicio}
                  className="btn-primary px-5 flex items-center gap-2 whitespace-nowrap">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            {/* Lista de servicios */}
            {formData.servicios.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Wrench size={36} className="mb-3 opacity-40" />
                <p className="text-sm font-medium">No hay servicios agregados</p>
                <p className="text-xs mt-1">Usa el formulario de arriba para agregar servicios</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {formData.servicios.length} servicio{formData.servicios.length !== 1 ? 's' : ''} agregado{formData.servicios.length !== 1 ? 's' : ''}
                </p>
                <ul className="space-y-2">
                  {formData.servicios.map((srv, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          srv.tipo === 'reparacion' ? 'bg-red-100 text-red-700' :
                          srv.tipo === 'diagnostico' ? 'bg-purple-100 text-purple-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>{srv.tipo}</span>
                        <span className="text-sm font-medium text-gray-700">{srv.descripcion}</span>
                        <span className="text-xs text-gray-400">·  {srv.tiempoEstimado} min</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-700 text-sm">
                          RD${Number(srv.costo).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </span>
                        <button type="button" onClick={() => handleRemoveServicio(idx)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end pt-2">
                  <span className="text-sm font-bold text-gray-700">
                    Subtotal servicios:&nbsp;
                    <span className="text-emerald-700">
                      RD${totalServicios.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Notas */}
            <div className="space-y-2">
              <label className="label-field">Notas / Síntomas reportados</label>
              <textarea className="input-field min-h-[90px] resize-y" placeholder="Describa el problema reportado por el cliente..."
                value={formData.notas}
                onChange={e => setFormData({ ...formData, notas: e.target.value })} />
            </div>
          </div>
        )}

        {/* ─── PASO 3: Resumen ─────────────────────────────── */}
        {paso === 3 && (
          <div className="space-y-6">
            <SectionTitle icono={ClipboardList} titulo="Resumen de la Orden" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ResumenCard titulo="Cliente" valor={clienteSeleccionado?.nombre || '—'} sub={clienteSeleccionado?.cedula} icono="👤" />
              <ResumenCard titulo="Vehículo" valor={vehiculoSeleccionado ? `${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo}` : '—'}
                sub={vehiculoSeleccionado?.placa} icono="🚗" />
              <ResumenCard titulo="Prioridad" valor={PRIORIDAD_LABEL[formData.prioridad]} icono="🏷️" />
              <ResumenCard titulo="Mecánico Asignado" valor={mecanicoSeleccionado?.nombre || 'Sin asignar'} icono="🔧" />
            </div>

            {/* Servicios */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                  Servicios ({formData.servicios.length})
                </p>
              </div>
              <ul className="divide-y divide-gray-100">
                {formData.servicios.map((srv, idx) => (
                  <li key={idx} className="flex justify-between items-center px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 capitalize">{srv.tipo}</span>
                      <span className="text-gray-700 font-medium">{srv.descripcion}</span>
                    </div>
                    <span className="font-bold text-emerald-700">
                      RD${Number(srv.costo).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-4 bg-emerald-50/50 border-t border-emerald-200 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Subtotal estimado (sin ITBIS)</span>
                  <span className="font-semibold text-gray-800">
                    RD${totalServicios.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>ITBIS estimado (18%)</span>
                  <span className="font-semibold text-gray-800">
                    RD${(totalServicios * 0.18).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-emerald-200/50">
                  <span className="text-sm font-bold text-gray-800">Total estimado (con ITBIS)</span>
                  <span className="text-lg font-bold text-emerald-700">
                    RD${(totalServicios * 1.18).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {formData.notas && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                <p className="font-semibold mb-1">Notas:</p>
                <p className="text-gray-700">{formData.notas}</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Botones de navegación ───────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
          <button
            type="button"
            onClick={irAnterior}
            disabled={paso === 1}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            <ChevronLeft size={18} /> Anterior
          </button>

          <div className="flex gap-1">
            {PASOS.map(p => (
              <div key={p.id} className={`h-1.5 rounded-full transition-all duration-300 ${
                p.id === paso ? 'w-6 bg-brand-primary' : p.id < paso ? 'w-3 bg-state-success' : 'w-3 bg-gray-200'
              }`} />
            ))}
          </div>

          {paso < PASOS.length ? (
            <button
              type="button"
              onClick={irSiguiente}
              className="flex items-center gap-2 btn-primary px-6"
            >
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={creatingOrden}
              className="flex items-center gap-2 btn-primary px-8"
            >
              {creatingOrden
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</>
                : <><Save size={17} /> Crear Orden</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Componentes auxiliares ─────────────────────────────── */
function SectionTitle({ icono: Icono, titulo }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <div className="p-1.5 rounded-lg bg-brand-light">
        <Icono size={16} className="text-brand-primary" />
      </div>
      <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{titulo}</h3>
    </div>
  )
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <input type={type} className="input-field" placeholder={placeholder}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function ResumenCard({ titulo, valor, sub, icono }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      <span className="text-2xl">{icono}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{titulo}</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{valor}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}