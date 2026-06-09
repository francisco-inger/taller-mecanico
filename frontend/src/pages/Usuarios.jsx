import { useState, useEffect } from 'react'
import { Users, Plus, Mail, Shield, Edit, UserCheck, UserX, Zap, Eye, EyeOff } from 'lucide-react'
import { useUsuarioStore } from '../store/usuarioStore'
import Modal from '../components/Modal'

const getRoleGradient = (rol) => {
  const gradients = {
    'ADMIN': 'from-orange-500 to-rose-600',
    'RECEPCIONISTA': 'from-blue-500 to-blue-600',
    'MECANICO': 'from-purple-500 to-pink-600',
    'CAJERO': 'from-green-500 to-emerald-600',
  }
  return gradients[rol] || 'from-gray-400 to-gray-600'
}

const getRoleBadgeColor = (rol) => {
  const colors = {
    'ADMIN': 'bg-orange-100 text-orange-700',
    'RECEPCIONISTA': 'bg-blue-100 text-blue-700',
    'MECANICO': 'bg-purple-100 text-purple-700',
    'CAJERO': 'bg-green-100 text-green-700',
  }
  return colors[rol] || 'bg-gray-100 text-gray-700'
}

export default function Usuarios() {
  const { usuarios, loading, error, fetchUsuarios, addUsuario, updateUsuario } = useUsuarioStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'RECEPCIONISTA',
    activo: true
  })

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleOpenCreate = () => {
    setEditingUser(null)
    setShowPassword(false)
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'RECEPCIONISTA',
      activo: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setShowPassword(false)
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
      activo: user.activo
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUser) {
        const submitData = { ...formData }
        if (!submitData.password) delete submitData.password
        await updateUsuario(editingUser.id, submitData)
      } else {
        await addUsuario(formData)
      }
      setIsModalOpen(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const totalAdmins = usuarios.filter(u => u.rol === 'ADMIN').length
  const totalRecepcionistas = usuarios.filter(u => u.rol === 'RECEPCIONISTA').length
  const totalMecanicos = usuarios.filter(u => u.rol === 'MECANICO').length
  const totalCajeros = usuarios.filter(u => u.rol === 'CAJERO').length

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-rose-500 bg-clip-text text-transparent">Gestión de Personal</h1>
          <p className="text-gray-500 mt-1">Administra usuarios y permisos del sistema</p>
        </div>
        <button 
          onClick={handleOpenCreate} 
          className="group relative bg-gradient-to-r from-orange-600 to-rose-500 hover:from-orange-700 hover:to-rose-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Usuarios', value: usuarios.length, gradient: 'from-slate-500 to-slate-600' },
          { label: 'Administradores', value: totalAdmins, gradient: 'from-orange-500 to-orange-600' },
          { label: 'Recepcionistas', value: totalRecepcionistas, gradient: 'from-blue-500 to-blue-600' },
          { label: 'Mecánicos', value: totalMecanicos, gradient: 'from-purple-500 to-purple-600' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-lg p-5 text-white group hover:shadow-xl transition-shadow`}>
            <p className="text-xs font-bold opacity-80 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Usuarios Grid */}
      <div className="flex-1 overflow-auto">
        {loading && usuarios.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Cargando usuarios...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Users size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No hay usuarios registrados</h3>
            <p className="text-sm text-gray-500">Crea tu primer usuario para comenzar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usuarios.map(u => (
              <div key={u.id} className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl transition-shadow group overflow-hidden relative">
                {/* Background accent */}
                <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-gradient-to-br ${getRoleGradient(u.rol)} opacity-5 rounded-full`}></div>
                
                {/* Header */}
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleGradient(u.rol)} text-white flex items-center justify-center font-bold text-lg`}>
                    {u.nombre.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="text-orange-600 hover:text-orange-700 p-2 rounded-lg hover:bg-orange-50 transition-all"
                  >
                    <Edit size={18} />
                  </button>
                </div>

                {/* Info */}
                <h3 className="font-bold text-gray-900 text-lg mb-1">{u.nombre}</h3>
                
                {/* Role Badge */}
                <div className={`inline-block px-2.5 py-1 text-xs font-bold uppercase rounded-full ${getRoleBadgeColor(u.rol)} mb-3`}>
                  {u.rol}
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Mail size={14} className="text-orange-500" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${u.activo ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={u.activo ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
            <input 
              required
              className="input-field"
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
            <input 
              required
              type="email"
              className="input-field"
              placeholder="juan@taller.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase">
              Contraseña {editingUser && '(Dejar en blanco para mantener)'}
            </label>
            <div className="relative">
              <input 
                required={!editingUser}
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Rol</label>
              <select 
                className="input-field"
                value={formData.rol}
                onChange={e => setFormData({...formData, rol: e.target.value})}
              >
                <option value="ADMIN">Administrador</option>
                <option value="RECEPCIONISTA">Recepcionista</option>
                <option value="MECANICO">Mecánico</option>
                <option value="CAJERO">Cajero</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
              <select 
                className="input-field"
                value={formData.activo}
                onChange={e => setFormData({...formData, activo: e.target.value === 'true'})}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
