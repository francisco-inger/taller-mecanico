import { useState, useEffect } from 'react'
import { Users, Search, Plus, Phone, Mail, Edit, MapPin } from 'lucide-react'
import { useClienteStore } from '../store/clienteStore'
import { useAuthStore } from '../store/authStore'
import Modal from '../components/Modal'
import ClienteForm from '../components/ClienteForm'
import { useVehiculoStore } from '../store/vehiculoStore'
import api from '../api/axios'

export default function Clientes() {
  const { clientes, loading, fetchClientes, addCliente, updateCliente } = useClienteStore()
  const { user } = useAuthStore()
  const { fetchVehiculosPorCliente } = useVehiculoStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const isAdmin = user?.rol === 'ADMIN'

  useEffect(() => {
    fetchClientes()
  }, [])

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
        if (!clienteId) throw new Error('clienteId no disponible para asociar el vehículo')

        await api.post('/vehiculos', {
          ...vehiculoData,
          clienteId,
          anio: parseInt(vehiculoData.anio),
          kilometraje: parseInt(vehiculoData.kilometraje) || 0
        })

        await fetchVehiculosPorCliente(clienteId)
      }

      handleCloseModal()
      fetchClientes()

    } catch (error) {
      console.error('Error al procesar cliente:', error)
      alert(error.response?.data?.message || 'Error al procesar la operación.')
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Directorio de Clientes</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClientes.map((cliente) => (
              <div key={cliente.id} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xl">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(cliente)}
                      className="text-emerald-600 hover:text-emerald-700 p-2 rounded-lg hover:bg-emerald-50 transition-all"
                    >
                      <Edit size={18} />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{cliente.nombre}</h3>
                <p className="text-xs text-gray-600 font-mono mb-4 bg-gray-50 px-2 py-1 rounded inline-block">{cliente.cedula}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0">
                      <Phone size={14} />
                    </div>
                    <span className="text-gray-700">{cliente.telefono}</span>
                  </div>
                  {cliente.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Mail size={14} />
                      </div>
                      <span className="text-gray-700 truncate">{cliente.email}</span>
                    </div>
                  )}
                  {cliente.direccion && (
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={14} />
                      </div>
                      <span className="text-gray-700 line-clamp-2">{cliente.direccion}</span>
                    </div>
                  )}
                </div>
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