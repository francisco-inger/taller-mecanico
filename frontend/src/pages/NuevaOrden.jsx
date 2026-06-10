import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, Car, Wrench, X, AlertCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useClienteStore } from '../store/clienteStore'
import { useVehiculoStore } from '../store/vehiculoStore'
import { useOrdenStore } from '../store/ordenStore'
import { useMecanicoStore } from '../store/mecanicoStore'
import api from '../api/axios'

export default function NuevaOrden() {
  const navigate = useNavigate()
  const { clientes, fetchClientes } = useClienteStore()
  const { vehiculos, fetchVehiculosPorCliente, loading: loadingVehiculos } = useVehiculoStore()
  const { crearOrden, loading: creatingOrden } = useOrdenStore()
  const { mecanicos, fetchMecanicos } = useMecanicoStore()

  const [formData, setFormData] = useState({
    clienteId: '',
    vehiculoId: '',
    mecanicoId: '',
    servicios: [],
    notas: '',
    prioridad: 'NORMAL'
  })

  const [servicioActual, setServicioActual] = useState({
    tipo: 'mantenimiento',
    descripcion: '',
    costo: 0,
    tiempoEstimado: 30
  })

  const [mostrarFormVehiculo, setMostrarFormVehiculo] = useState(false)
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    marca: '', modelo: '', anio: '', placa: '', color: '', kilometraje: ''
  })
  const [guardandoVehiculo, setGuardandoVehiculo] = useState(false)
  const [errorVehiculo, setErrorVehiculo] = useState('')

  useEffect(() => {
    fetchClientes()
    fetchMecanicos()
  }, [])

  useEffect(() => {
    if (formData.clienteId) {
      fetchVehiculosPorCliente(formData.clienteId)
      setFormData(prev => ({ ...prev, vehiculoId: '' }))
      setMostrarFormVehiculo(false)
    }
  }, [formData.clienteId])

  const handleAddServicio = () => {
    if (servicioActual.descripcion.trim()) {
      setFormData(prev => ({
        ...prev,
        servicios: [...prev.servicios, { ...servicioActual }]
      }))
      setServicioActual({ tipo: 'mantenimiento', descripcion: '', costo: 0, tiempoEstimado: 30 })
    }
  }

  const handleRemoveServicio = (idx) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== idx)
    }))
  }

  const handleGuardarVehiculo = async () => {
    if (!nuevoVehiculo.marca || !nuevoVehiculo.modelo || !nuevoVehiculo.placa || !nuevoVehiculo.anio) {
      setErrorVehiculo('Marca, modelo, año y placa son obligatorios.')
      return
    }
    setGuardandoVehiculo(true)
    setErrorVehiculo('')
    try {
      const response = await api.post('/vehiculos', {
        ...nuevoVehiculo,
        clienteId: formData.clienteId,
        anio: parseInt(nuevoVehiculo.anio),
        kilometraje: parseInt(nuevoVehiculo.kilometraje) || 0
      })
      await fetchVehiculosPorCliente(formData.clienteId)
      setFormData(prev => ({ ...prev, vehiculoId: response.data.data.id }))
      setMostrarFormVehiculo(false)
      setNuevoVehiculo({ marca: '', modelo: '', anio: '', placa: '', color: '', kilometraje: '' })
    } catch (err) {
      setErrorVehiculo(err.response?.data?.message || 'Error al guardar el vehículo.')
    } finally {
      setGuardandoVehiculo(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await crearOrden(formData)
      navigate('/ordenes')
    } catch (error) {
      console.error('Error al crear orden:', error)
      alert('Error al crear la orden de servicio.')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Crear Nueva Orden</h2>
        <button className="text-sm font-medium text-gray-500 hover:text-gray-700" onClick={() => navigate('/ordenes')}>
          Cancelar
        </button>
      </div>

      <div className="card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Cliente y Vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <User size={16} className="mr-2 text-brand-500" /> Seleccionar Cliente
              </label>
              <select
                className="input-field bg-white"
                value={formData.clienteId}
                onChange={e => setFormData({...formData, clienteId: e.target.value})}
                required
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.cedula})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Car size={16} className="mr-2 text-brand-500" /> Seleccionar Vehículo
              </label>
              <select
                className="input-field bg-white"
                value={formData.vehiculoId}
                onChange={e => setFormData({...formData, vehiculoId: e.target.value})}
                required={!mostrarFormVehiculo}
                disabled={!formData.clienteId || loadingVehiculos}
              >
                <option value="">{loadingVehiculos ? 'Cargando...' : 'Seleccione un vehículo...'}</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.marca} {v.modelo} - {v.placa}</option>
                ))}
              </select>

              {/* Mensaje si no tiene vehículos */}
              {!loadingVehiculos && formData.clienteId && vehiculos.length === 0 && !mostrarFormVehiculo && (
                <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> Este cliente no tiene vehículos registrados.
                  </p>
                  <button
                    type="button"
                    onClick={() => setMostrarFormVehiculo(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={12} /> Agregar
                  </button>
                </div>
              )}

              {/* Botón agregar vehículo si ya tiene pero quiere agregar otro */}
              {!loadingVehiculos && formData.clienteId && vehiculos.length > 0 && !mostrarFormVehiculo && (
                <button
                  type="button"
                  onClick={() => setMostrarFormVehiculo(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                >
                  <Plus size={12} /> Registrar nuevo vehículo para este cliente
                </button>
              )}
            </div>
          </div>

          {/* Formulario de nuevo vehículo */}
          {mostrarFormVehiculo && (
            <div className="border border-blue-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-blue-50">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Car size={16} /> Registrar Nuevo Vehículo
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Marca *</label>
                    <input type="text" className="input-field" placeholder="Toyota, Honda..." value={nuevoVehiculo.marca} onChange={e => setNuevoVehiculo({...nuevoVehiculo, marca: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Modelo *</label>
                    <input type="text" className="input-field" placeholder="Corolla, Civic..." value={nuevoVehiculo.modelo} onChange={e => setNuevoVehiculo({...nuevoVehiculo, modelo: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Año *</label>
                    <input type="number" className="input-field" placeholder="2020" min="1900" max="2030" value={nuevoVehiculo.anio} onChange={e => setNuevoVehiculo({...nuevoVehiculo, anio: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Placa *</label>
                    <input type="text" className="input-field" placeholder="A123456" value={nuevoVehiculo.placa} onChange={e => setNuevoVehiculo({...nuevoVehiculo, placa: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                    <input type="text" className="input-field" placeholder="Blanco..." value={nuevoVehiculo.color} onChange={e => setNuevoVehiculo({...nuevoVehiculo, color: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Kilometraje</label>
                  <input type="number" className="input-field" placeholder="45000" min="0" value={nuevoVehiculo.kilometraje} onChange={e => setNuevoVehiculo({...nuevoVehiculo, kilometraje: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setMostrarFormVehiculo(false)} className="btn-secondary text-sm">Cancelar</button>
                  <button type="button" onClick={handleGuardarVehiculo} disabled={guardandoVehiculo} className="btn-primary text-sm flex items-center gap-2">
                    {guardandoVehiculo ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                    Guardar Vehículo
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Prioridad</label>
              <select className="input-field" value={formData.prioridad} onChange={e => setFormData({...formData, prioridad: e.target.value})}>
                <option value="NORMAL">Normal</option>
                <option value="URGENTE">Urgente</option>
                <option value="VIP">Prioridad VIP</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center text-sm font-medium text-gray-700">
                <User size={16} className="mr-2 text-brand-500" /> Asignar Mecánico (Opcional)
              </label>
              <select className="input-field bg-white" value={formData.mecanicoId} onChange={e => setFormData({...formData, mecanicoId: e.target.value})}>
                <option value="">Sin asignar por ahora...</option>
                {mecanicos.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} - {m.especialidad}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Servicios */}
          <div className="space-y-4">
            <label className="flex items-center text-sm font-medium text-gray-700">
              <Wrench size={16} className="mr-2 text-brand-500" /> Agregar Servicios
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <select className="input-field md:col-span-1" value={servicioActual.tipo} onChange={e => setServicioActual({...servicioActual, tipo: e.target.value})}>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="reparacion">Reparación</option>
                <option value="diagnostico">Diagnóstico</option>
              </select>
              <input
                type="text"
                className="input-field md:col-span-2"
                placeholder="Descripción del servicio..."
                value={servicioActual.descripcion}
                onChange={e => setServicioActual({...servicioActual, descripcion: e.target.value})}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddServicio())}
              />
              <button type="button" onClick={handleAddServicio} className="btn-secondary whitespace-nowrap">Agregar</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Costo (RD$)</label>
                <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={servicioActual.costo || ''} onChange={e => setServicioActual({...servicioActual, costo: parseFloat(e.target.value) || 0})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Tiempo (min)</label>
                <input type="number" min="0" className="input-field" placeholder="30" value={servicioActual.tiempoEstimado || ''} onChange={e => setServicioActual({...servicioActual, tiempoEstimado: parseInt(e.target.value) || 30})} />
              </div>
            </div>
            {formData.servicios.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <ul className="space-y-2">
                  {formData.servicios.map((srv, idx) => (
                    <li key={idx} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm border border-gray-100 text-sm">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-100 text-brand-700 mr-2">{srv.tipo}</span>
                        <span className="font-medium text-gray-700">{srv.descripcion}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-emerald-700 font-bold text-sm">RD${Number(srv.costo).toLocaleString('es-DO', {minimumFractionDigits: 2})}</span>
                        <button type="button" onClick={() => handleRemoveServicio(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"><X size={16} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Notas */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notas / Detalles / Síntomas</label>
            <textarea
              className="input-field min-h-[100px] resize-y"
              placeholder="Describa el problema reportado por el cliente o detalles adicionales..."
              value={formData.notas}
              onChange={e => setFormData({...formData, notas: e.target.value})}
            ></textarea>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="btn-primary flex items-center px-8" disabled={formData.servicios.length === 0 || creatingOrden}>
              {creatingOrden ? 'Creando...' : <><Save size={18} className="mr-2" />Crear Orden de Servicio</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}