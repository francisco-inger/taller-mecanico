import { useState, useEffect } from 'react'
import { Users, Search, Plus, Phone, Mail, Edit, MapPin, Car, ChevronDown, ChevronUp } from 'lucide-react'
import { useClienteStore } from '../store/clienteStore'
import { useAuthStore } from '../store/authStore'
import Modal from '../components/Modal'
import ClienteForm from '../components/ClienteForm'
import api from '../api/axios'
import { useToast } from '../components/Toast'

export default function Clientes() {
  const { clientes, loading, fetchClientes, addCliente, updateCliente } = useClienteStore()
  const { user } = useAuthStore()
  const toast = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [vehiculosPorCliente, setVehiculosPorCliente] = useState({})
  const [expandedCliente, setExpandedCliente] = useState(null)
  const [loadingVehiculos, setLoadingVehiculos] = useState({})

  const isAdmin = user?.rol === 'ADMIN'

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleToggleVehiculos = async (clienteId) => {
    if (expandedCliente === clienteId) {
      setExpandedCliente(null)
      return
    }
    setExpandedCliente(clienteId)
    if (!vehiculosPorCliente[clienteId]) {
      setLoadingVehiculos(prev => ({ ...prev, [clienteId]: true }))
      try {
        const response = await api.get(`/vehiculos/cliente/${clienteId}`)
        setVehiculosPorCliente(prev => ({ ...prev, [clienteId]: response.data.data || [] }))
      } catch (error) {
        setVehiculosPorCliente(prev => ({ ...prev, [clienteId]: [] }))
      } finally {
        setLoadingVehiculos(prev => ({ ...prev, [clienteId]: false }))
      }
    }
  }

  const handleSubmit = async (data, vehiculoData) => {
    try {
      let cliente
      if (editingCliente) {
        cliente = await updateCliente(editingCliente.id, data)
      } else {
        cliente = await addCliente(data)
      }

      if (vehiculoData) {
        const clienteId = cliente?.id || editingCliente?.id
        if (!clienteId) throw new Error('clienteId no disponible')
        await api.post('/vehiculos', {
          ...vehiculoData,
          clienteId,
          anio: parseInt(vehiculoData.anio),
          kilometraje: parseInt(vehiculoData.kilometraje) || 0
        })
        // Refrescar vehículos de ese cliente
        const response = await api.get(`/vehiculos/cliente/${clienteId}`)
        setVehiculosPorCliente(prev => ({ ...prev, [clienteId]: response.data.data || [] }))
      }

      handleCloseModal()
      fetchClientes()
      toast.success(editingCliente ? 'Cliente actualizado' : 'Cliente registrado exitosamente')
    } catch (error) {
      console.error('Error al procesar cliente:', error)
      toast.error(error.response?.data?.message || 'Error al procesar la operación.')
    }
  }

  const handleOpenEdit = (cliente) => {
    setEditingCliente(cliente)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCliente(null)
  }

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cedula.includes(searchTerm) ||
    c.telefono.includes(searchTerm)
  )

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Listado de Clientes</h2>
          <p className="text-gray-500 mt-1">Gestiona todos los clientes de tu taller</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Cliente
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-shadow">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
            <Search size={20} />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 transition-all duration-300"
            placeholder="Buscar por nombre, cédula o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Clientes Grid */}
      <div className="flex-1 overflow-auto">
        {loading && clientes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando clientes...</p>
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Users size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {searchTerm ? 'No se encontraron resultados' : 'No hay clientes registrados'}
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? `No hay coincidencias para "${searchTerm}"` : 'Agrega tu primer cliente para comenzar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClientes.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-6px_rgba(16,185,129,0.12)] hover:border-emerald-200/50 hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
              >
                <div className="p-6 flex-1">
                  {/* Avatar y editar */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center font-extrabold text-xl shadow-inner">
                      {cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleOpenEdit(cliente)}
                        className="text-gray-400 hover:text-emerald-600 p-2.5 rounded-xl hover:bg-emerald-50/60 transition-all duration-200"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>

                  {/* Nombre y Cédula */}
                  <h3 className="font-bold text-gray-800 text-lg mb-1.5 group-hover:text-emerald-900 transition-colors truncate">
                    {cliente.nombre}
                  </h3>
                  <div className="mb-5">
                    <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase bg-gray-50 border border-gray-200/60 px-2 py-0.5 rounded-md font-mono">
                      Cédula: {cliente.cedula || 'N/D'}
                    </span>
                  </div>

                  {/* Información de contacto */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Phone size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                      <span className="font-medium">{cliente.telefono}</span>
                    </div>
                    {cliente.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                        <span className="font-medium truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.direccion && (
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <MapPin size={16} className="text-gray-400 mt-0.5 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                        <span className="font-medium line-clamp-2 leading-relaxed">{cliente.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botón ver vehículos */}
                <button
                  onClick={() => handleToggleVehiculos(cliente.id)}
                  className={`w-full flex items-center justify-between px-6 py-4 transition-all duration-200 border-t ${
                    expandedCliente === cliente.id 
                      ? 'bg-emerald-50/40 border-emerald-100/60' 
                      : 'bg-gray-50/50 hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    <Car size={14} className={expandedCliente === cliente.id ? 'text-emerald-600' : 'text-gray-400'} />
                    <span>Vehículos registrados</span>
                  </div>
                  {expandedCliente === cliente.id
                    ? <ChevronUp size={16} className="text-emerald-600" />
                    : <ChevronDown size={16} className="text-gray-400" />
                  }
                </button>

                {/* Lista de vehículos */}
                {expandedCliente === cliente.id && (
                  <div className="px-6 pb-5 pt-3 bg-emerald-50/20 border-t border-emerald-100/40">
                    {loadingVehiculos[cliente.id] ? (
                      <div className="py-4 flex justify-center">
                        <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      </div>
                    ) : vehiculosPorCliente[cliente.id]?.length > 0 ? (
                      <div className="space-y-2.5">
                        {vehiculosPorCliente[cliente.id].map((v) => (
                          <div key={v.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-all duration-200">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <Car size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 leading-tight">{v.marca} {v.modelo} <span className="text-gray-400 font-normal">({v.anio})</span></p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-bold bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded leading-none">
                                  {v.placa}
                                </span>
                                {v.color && (
                                  <span className="text-xs text-gray-500 capitalize">
                                    · {v.color}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-5 text-center bg-white/50 border border-dashed border-gray-200 rounded-2xl">
                        <Car size={20} className="mx-auto text-gray-300 mb-1.5" />
                        <p className="text-xs text-gray-400 font-medium">Sin vehículos registrados</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCliente ? "Editar Información del Cliente" : "Registrar Nuevo Cliente"}
      >
        <ClienteForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={loading}
          initialData={editingCliente}
        />
      </Modal>
    </div>
  )
}