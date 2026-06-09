import { useState } from 'react'
import { User, Phone, Mail, CreditCard, Save } from 'lucide-react'

export default function ClienteForm({ onSubmit, onCancel, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    cedula: initialData?.cedula || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          <User size={14} className="mr-2 text-brand-500" /> Nombre Completo
        </label>
        <input
          required
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="input-field"
          placeholder="Ej. Juan Pérez"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <CreditCard size={14} className="mr-2 text-brand-500" /> Cédula / RNC
          </label>
          <input
            required
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            className="input-field"
            placeholder="001-0000000-0"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 flex items-center">
            <Phone size={14} className="mr-2 text-brand-500" /> Teléfono
          </label>
          <input
            required
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="input-field"
            placeholder="809-555-5555"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          <Mail size={14} className="mr-2 text-brand-500" /> Correo Electrónico
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="input-field"
          placeholder="juan.perez@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-gray-700 flex items-center">
          Dirección
        </label>
        <textarea
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className="input-field min-h-[80px]"
          placeholder="Calle 123, Ensanche La Fe..."
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
          ) : (
            <Save size={18} className="mr-2" />
          )}
          Guardar Cliente
        </button>
      </div>
    </form>
  )
}
