import { useState } from 'react'
import { User, Phone, Mail, CreditCard, Save, Car, Plus, ChevronDown, ChevronUp } from 'lucide-react'

export default function ClienteForm({ onSubmit, onCancel, isLoading, initialData }) {
  const [formData, setFormData] = useState({
    nombre: initialData?.nombre || '',
    cedula: initialData?.cedula || '',
    telefono: initialData?.telefono || '',
    email: initialData?.email || '',
    direccion: initialData?.direccion || ''
  })

  const [agregarVehiculo, setAgregarVehiculo] = useState(false)
  const [vehiculoData, setVehiculoData] = useState({
    marca: '',
    modelo: '',
    anio: '',
    placa: '',
    color: '',
    kilometraje: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleVehiculoChange = (e) => {
    const { name, value } = e.target
    setVehiculoData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData, agregarVehiculo ? vehiculoData : null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Datos del cliente */}
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
        <label className="text-sm font-semibold text-gray-700">Dirección</label>
        <textarea
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          className="input-field min-h-[80px]"
          placeholder="Calle 123, Ensanche La Fe..."
        />
      </div>

      {/* Sección vehículo opcional */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAgregarVehiculo(!agregarVehiculo)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Car size={16} className="text-brand-500" />
            Agregar Vehículo (Opcional)
          </div>
          {agregarVehiculo ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </button>

        {agregarVehiculo && (
          <div className="p-4 space-y-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Marca</label>
                <input
                  type="text"
                  name="marca"
                  value={vehiculoData.marca}
                  onChange={handleVehiculoChange}
                  className="input-field"
                  placeholder="Toyota, Honda, Ford..."
                  required={agregarVehiculo}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Modelo</label>
                <input
                  type="text"
                  name="modelo"
                  value={vehiculoData.modelo}
                  onChange={handleVehiculoChange}
                  className="input-field"
                  placeholder="Corolla, Civic, F-150..."
                  required={agregarVehiculo}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Año</label>
                <input
                  type="number"
                  name="anio"
                  value={vehiculoData.anio}
                  onChange={handleVehiculoChange}
                  className="input-field"
                  placeholder="2020"
                  min="1900"
                  max="2030"
                  required={agregarVehiculo}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Placa</label>
                <input
                  type="text"
                  name="placa"
                  value={vehiculoData.placa}
                  onChange={handleVehiculoChange}
                  className="input-field"
                  placeholder="A123456"
                  required={agregarVehiculo}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase">Color</label>
                <input
                  type="text"
                  name="color"
                  value={vehiculoData.color}
                  onChange={handleVehiculoChange}
                  className="input-field"
                  placeholder="Blanco, Negro..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase">Kilometraje</label>
              <input
                type="number"
                name="kilometraje"
                value={vehiculoData.kilometraje}
                onChange={handleVehiculoChange}
                className="input-field"
                placeholder="45000"
                min="0"
              />
            </div>
          </div>
        )}
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