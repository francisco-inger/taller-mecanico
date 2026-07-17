import { useState, useEffect } from 'react'
import { Settings, Building, Percent, Palette, ShieldCheck, Save, Loader2, Sparkles } from 'lucide-react'
import { useConfigStore } from '../store/configStore'
import { useToast } from '../components/Toast'

export default function Configuracion() {
  const { config, loading, updateConfig, fetchConfig } = useConfigStore()
  const toast = useToast()

  // Local state for forms
  const [empresaForm, setEmpresaForm] = useState({
    nombre_taller: '',
    rnc: '',
    direccion: '',
    telefono: '',
    correo: '',
  })

  const [fiscalForm, setFiscalForm] = useState({
    itbis_porcentaje: '18',
    moneda: 'RD$',
  })

  const [aparienciaForm, setAparienciaForm] = useState({
    tema: 'claro',
    color_acento: 'azul-verde',
  })

  // Sync state with store on load
  useEffect(() => {
    if (config) {
      setEmpresaForm({
        nombre_taller: config.nombre_taller || '',
        rnc: config.rnc || '',
        direccion: config.direccion || '',
        telefono: config.telefono || '',
        correo: config.correo || '',
      })
      setFiscalForm({
        itbis_porcentaje: config.itbis_porcentaje || '18',
        moneda: config.moneda || 'RD$',
      })
      setAparienciaForm({
        tema: config.tema || 'claro',
        color_acento: config.color_acento || 'azul-verde',
      })
    }
  }, [config])

  const handleSaveEmpresa = async (e) => {
    e.preventDefault()
    try {
      const payload = Object.entries(empresaForm).map(([key, val]) => ({
        clave: key,
        valor: val,
      }))
      await updateConfig(payload)
      toast.show('Información del negocio guardada exitosamente.', 'success')
    } catch (err) {
      toast.show('Error al guardar la información: ' + err.message, 'error')
    }
  }

  const handleSaveFiscal = async (e) => {
    e.preventDefault()
    try {
      const payload = Object.entries(fiscalForm).map(([key, val]) => ({
        clave: key,
        valor: val,
      }))
      await updateConfig(payload)
      toast.show('Configuración fiscal actualizada.', 'success')
    } catch (err) {
      toast.show('Error al guardar la configuración fiscal: ' + err.message, 'error')
    }
  }

  const handleSaveApariencia = async (e) => {
    e.preventDefault()
    try {
      const payload = Object.entries(aparienciaForm).map(([key, val]) => ({
        clave: key,
        valor: val,
      }))
      await updateConfig(payload)
      toast.show('Preferencia de apariencia aplicada con éxito.', 'success')
    } catch (err) {
      toast.show('Error al aplicar tema: ' + err.message, 'error')
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Settings className="w-7 h-7 text-brand-primary" />
            Configuración del Sistema
          </h2>
          <p className="text-gray-500 mt-1">Gestiona parámetros globales y apariencia del taller.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
        
        {/* ── 1. Información del Negocio ── */}
        <form onSubmit={handleSaveEmpresa} className="card bg-white p-6 shadow-md rounded-2xl flex flex-col space-y-4 border border-gray-150">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
              <Building size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Información del Negocio</h3>
              <p className="text-xs text-gray-500">Datos mostrados en el comprobante fiscal y facturas.</p>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            <div className="space-y-1">
              <label htmlFor="cfg-nombre" className="label-field">Nombre del Taller</label>
              <input
                id="cfg-nombre"
                type="text"
                className="input-field"
                value={empresaForm.nombre_taller}
                onChange={e => setEmpresaForm({ ...empresaForm, nombre_taller: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="cfg-rnc" className="label-field">RNC (Fiscal)</label>
                <input
                  id="cfg-rnc"
                  type="text"
                  placeholder="131-XXXXX-X"
                  className="input-field"
                  value={empresaForm.rnc}
                  onChange={e => setEmpresaForm({ ...empresaForm, rnc: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="cfg-telefono" className="label-field">Teléfono</label>
                <input
                  id="cfg-telefono"
                  type="text"
                  placeholder="809-555-1234"
                  className="input-field"
                  value={empresaForm.telefono}
                  onChange={e => setEmpresaForm({ ...empresaForm, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="cfg-correo" className="label-field">Correo Electrónico</label>
              <input
                id="cfg-correo"
                type="email"
                placeholder="contacto@taller.com"
                className="input-field"
                value={empresaForm.correo}
                onChange={e => setEmpresaForm({ ...empresaForm, correo: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="cfg-direccion" className="label-field">Dirección</label>
              <textarea
                id="cfg-direccion"
                rows={2}
                className="input-field resize-none"
                value={empresaForm.direccion}
                onChange={e => setEmpresaForm({ ...empresaForm, direccion: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar Datos
            </button>
          </div>
        </form>

        {/* ── 2. Configuración Fiscal ── */}
        <div className="space-y-6 flex flex-col justify-between">
          <form onSubmit={handleSaveFiscal} className="card bg-white p-6 shadow-md rounded-2xl flex flex-col space-y-4 border border-gray-150">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center">
                <Percent size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Configuración Fiscal</h3>
                <p className="text-xs text-gray-500">Impuestos y moneda default aplicados a las órdenes.</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="cfg-itbis" className="label-field">Porcentaje ITBIS (%)</label>
                  <div className="relative">
                    <input
                      id="cfg-itbis"
                      type="number"
                      min="0"
                      max="100"
                      className="input-field pr-8"
                      value={fiscalForm.itbis_porcentaje}
                      onChange={e => setFiscalForm({ ...fiscalForm, itbis_porcentaje: e.target.value })}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 text-sm">
                      %
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="cfg-moneda" className="label-field">Moneda del Sistema</label>
                  <input
                    id="cfg-moneda"
                    type="text"
                    className="input-field"
                    value={fiscalForm.moneda}
                    onChange={e => setFiscalForm({ ...fiscalForm, moneda: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Vista previa de cálculo */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-250/30 text-xs space-y-2">
                <p className="font-semibold text-gray-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-500" />
                  Simulación de cálculo de factura:
                </p>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal servicio:</span>
                  <span>{fiscalForm.moneda}1,000.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ITBIS ({fiscalForm.itbis_porcentaje}%):</span>
                  <span>{fiscalForm.moneda}{(1000 * (Number(fiscalForm.itbis_porcentaje) || 0) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-2 mt-2">
                  <span>Total estimado:</span>
                  <span>{fiscalForm.moneda}{(1000 + (1000 * (Number(fiscalForm.itbis_porcentaje) || 0) / 100)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Actualizar Impuesto
              </button>
            </div>
          </form>

          {/* ── 3. Apariencia ── */}
          <form onSubmit={handleSaveApariencia} className="card bg-white p-6 shadow-md rounded-2xl flex flex-col space-y-4 border border-gray-150">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white flex items-center justify-center">
                <Palette size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Apariencia del Sistema</h3>
                <p className="text-xs text-gray-500">Elige el tema visual y la paleta de colores de la interfaz.</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selector de Tema */}
                <div className="space-y-2">
                  <span className="label-field">Tema General</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAparienciaForm({ ...aparienciaForm, tema: 'claro' })}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold text-sm transition-all active:scale-95 ${
                        aparienciaForm.tema === 'claro'
                          ? 'border-brand-primary bg-brand-primary-light/10 text-brand-primary'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      ☀️ Claro
                    </button>
                    <button
                      type="button"
                      onClick={() => setAparienciaForm({ ...aparienciaForm, tema: 'oscuro' })}
                      className={`flex-1 py-2 px-3 rounded-lg border font-semibold text-sm transition-all active:scale-95 ${
                        aparienciaForm.tema === 'oscuro'
                          ? 'border-brand-primary bg-brand-primary-light/10 text-brand-primary'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      🌙 Oscuro
                    </button>
                  </div>
                </div>

                {/* Paleta de Color */}
                <div className="space-y-2">
                  <label htmlFor="cfg-acento" className="label-field">Color de Acento</label>
                  <select
                    id="cfg-acento"
                    className="input-field"
                    value={aparienciaForm.color_acento}
                    onChange={e => setAparienciaForm({ ...aparienciaForm, color_acento: e.target.value })}
                  >
                    <option value="azul-verde">Azul - Verde (Default)</option>
                    <option value="indigo-cyan">Índigo - Cian</option>
                    <option value="carmesi-ambar">Carmesí - Ámbar</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all duration-300 hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Aplicar Apariencia
              </button>
            </div>
          </form>

        </div>

      </div>

      {/* 🔒 4. Seguridad & API Info (Footer) */}
      <div className="card bg-gray-50 p-4 border border-gray-200/50 rounded-2xl flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-emerald-500" size={16} />
          <span>Configuración protegida por directivas de seguridad JWT.</span>
        </div>
        <span>Sesión activa: 8 horas máximo.</span>
      </div>
    </div>
  )
}
