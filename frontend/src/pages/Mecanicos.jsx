import { useState, useEffect } from 'react'
import { Plus, Wrench, Phone, Award, Edit, UserCheck, UserX, Zap } from 'lucide-react'
import { useMecanicoStore } from '../store/mecanicoStore'
import Modal from '../components/Modal'

export default function Mecanicos() {
  const { mecanicos, loading, fetchMecanicos, addMecanico, updateMecanico } = useMecanicoStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMecanico, setEditingMecanico] = useState(null)
  
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    especialidad: '',
    activo: true
  })

  useEffect(() => {
    fetchMecanicos()
  }, [])

  const handleOpenCreate = () => {
    setEditingMecanico(null)
    setFormData({ nombre: '', telefono: '', especialidad: '', activo: true })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (mecanico) => {
    setEditingMecanico(mecanico)
    setFormData({
      nombre: mecanico.nombre,
      telefono: mecanico.telefono || '',
      especialidad: mecanico.especialidad || '',
      activo: mecanico.activo
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMecanico) {
        await updateMecanico(editingMecanico.id, formData)
      } else {
        await addMecanico(formData)
      }
      setIsModalOpen(false)
    } catch (err) {
      alert('Error al guardar mecánico')
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Equipo Técnico</h2>
          <p className="text-gray-500 mt-1">Gestiona al personal técnico y sus especialidades</p>
        </div>
        <button 
          onClick={handleOpenCreate} 
          className="group relative text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #1A7FD4, #0F9D6E)' }}
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Mecánico
        </button>
      </div>

      {/* Mecanicos Grid */}
      <div className="flex-1 overflow-auto">
        {loading && mecanicos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando equipo de mecánicos...</p>
          </div>
        ) : mecanicos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Wrench size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay mecánicos registrados</h3>
            <p className="text-sm text-gray-500">Agrega tu primer mecánico para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mecanicos.map(m => (
              <div key={m.id} className={`bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow group overflow-hidden relative ${!m.activo ? 'opacity-60' : ''}`}>
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-gradient-to-br from-red-500 to-rose-600 opacity-5 rounded-full"></div>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center font-bold text-xl">
                    {m.nombre.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => handleOpenEdit(m)}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all"
                  >
                    <Edit size={18} />
                  </button>
                </div>

                {/* Info */}
                <h3 className="font-bold text-gray-900 text-lg mb-1">{m.nombre}</h3>
                {m.especialidad && (
                  <p className="text-xs font-semibold text-red-600 uppercase mb-4 flex items-center gap-1">
                    <Zap size={12} /> {m.especialidad}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center flex-shrink-0">
                      <Phone size={14} />
                    </div>
                    <span className="text-gray-700">{m.telefono || 'Sin teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center flex-shrink-0">
                      <Award size={14} />
                    </div>
                    <span className="text-gray-700">{m.especialidad || 'Mecánico General'}</span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-xs pt-3 border-t border-gray-200">
                  <div className={`w-2 h-2 rounded-full ${m.activo ? 'bg-state-success' : 'bg-state-danger'}`}></div>
                  <span className={m.activo ? 'text-state-success font-semibold' : 'text-state-danger font-semibold'}>
                    {m.activo ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingMecanico ? "Editar Mecánico" : "Registrar Nuevo Mecánico"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
            <input 
              required
              className="input-field"
              placeholder="Ej. Pedro Ramírez"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Teléfono</label>
              <input 
                required
                className="input-field"
                placeholder="809-000-0000"
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Especialidad</label>
              <input 
                className="input-field"
                placeholder="Ej. Frenos, Motores..."
                value={formData.especialidad}
                onChange={e => setFormData({...formData, especialidad: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
            <select 
              className="input-field"
              value={formData.activo}
              onChange={e => setFormData({...formData, activo: e.target.value === 'true'})}
            >
              <option value="true">Activo (Disponible para trabajar)</option>
              <option value="false">Inactivo (No disponible)</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
