import { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck, FileSpreadsheet, Lock, Scale, Accessibility,
  UserCog, Gavel, PenLine, RefreshCw, AlertTriangle, Check,
  Plus, X, Save, Trash2, HelpCircle, CheckCircle, Info
} from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import { useAuthStore } from '../store/authStore'
import { useClienteStore } from '../store/clienteStore'
import { useConsentimientoStore } from '../store/consentimientoStore'
import { useSolicitudArcoStore } from '../store/solicitudArcoStore'
import { useFirmaStore } from '../store/firmaStore'
import { useConfigStore } from '../store/configStore'

const ARCO_ESTADOS = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-amber-100 text-amber-800' },
  EN_PROCESO: { label: 'En Proceso', color: 'bg-blue-100 text-blue-800' },
  COMPLETADA: { label: 'Completada', color: 'bg-emerald-100 text-emerald-800' },
  RECHAZADA: { label: 'Rechazada', color: 'bg-rose-100 text-rose-800' }
}

export default function MarcoLegal() {
  const toast = useToast()
  const { user } = useAuthStore()
  
  // Stores
  const { clientes, fetchClientes } = useClienteStore()
  const { consentimientos, fetchConsentimientos, guardarConsentimiento } = useConsentimientoStore()
  const { solicitudes, fetchSolicitudes, crearSolicitud, actualizarEstadoSolicitud } = useSolicitudArcoStore()
  const { firmas, fetchFirmas, guardarFirma } = useFirmaStore()
  const { config, patchConfig } = useConfigStore()

  // Tab activa: auditoria | privacidad | arco | accesibilidad | roles | cumplimiento | firma
  const [activeTab, setActiveTab] = useState('auditoria')
  const [loading, setLoading] = useState(false)

  // 1. Auditoría
  const [logs, setLogs] = useState([])
  const [filtroEntidad, setFiltroEntidad] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [limiteLogs, setLimiteLogs] = useState(50)
  const [usuariosSistema, setUsuariosSistema] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // 2. Consentimientos
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [consentimientoTipo, setConsentimientoTipo] = useState('COMPARTIR_TERCEROS')
  const [consentimientoOtorgado, setConsentimientoOtorgado] = useState(true)
  const [consentimientoObs, setConsentimientoObs] = useState('')

  // 3. Solicitudes ARCO
  const [arcoClienteId, setArcoClienteId] = useState('')
  const [arcoTipo, setArcoTipo] = useState('ACCESO')
  const [arcoDescripcion, setArcoDescripcion] = useState('')
  const [arcoResolviendoId, setArcoResolviendoId] = useState(null)
  const [arcoNuevoEstado, setArcoNuevoEstado] = useState('COMPLETADA')
  const [arcoRespuestaText, setArcoRespuestaText] = useState('')

  // 4. Accesibilidad (Persistido localmente)
  const [altoContraste, setAltoContraste] = useState(() => localStorage.getItem('accesibilidad-contraste') === 'true')
  const [tamanioTexto, setTamanioTexto] = useState(() => localStorage.getItem('accesibilidad-texto') || 'base')
  
  // Checklist WCAG
  const [checklistWcag, setChecklistWcag] = useState(() => {
    const g = localStorage.getItem('checklist-wcag')
    return g ? JSON.parse(g) : {
      contrasteTexto: true,
      navegacionTeclado: false,
      lectoresPantalla: false,
      textosAlternativos: true,
      formulariosEtiquetados: false
    }
  })

  // 6. Cumplimiento
  const [politicaTexto, setPoliticaTexto] = useState('')

  // 7. Firma Digital
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [firmanteNombre, setFirmanteNombre] = useState('')
  const [firmaEntidad, setFirmaEntidad] = useState('CONSENTIMIENTO')
  const [firmaEntidadId, setFirmaEntidadId] = useState('')

  useEffect(() => {
    fetchClientes()
    cargarUsuarios()
    cargarPolitica()
  }, [])

  useEffect(() => {
    if (activeTab === 'auditoria') cargarLogs()
    if (activeTab === 'privacidad') fetchConsentimientos()
    if (activeTab === 'arco') fetchSolicitudes()
    if (activeTab === 'firma') fetchFirmas()
  }, [activeTab, filtroEntidad, filtroUsuario, limiteLogs])

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuariosSistema(res.data.data || [])
    } catch (e) {
      console.error(e)
    }
  }

  const cargarPolitica = async () => {
    try {
      const res = await api.get('/configuracion')
      const pol = (res.data.data || []).find(c => c.clave === 'politica_privacidad')
      setPoliticaTexto(pol?.valor || defaultPolitica)
    } catch {
      setPoliticaTexto(defaultPolitica)
    }
  }

  const defaultPolitica = `POLÍTICA DE PRIVACIDAD INTERNA — SIGEST TALLER MECÁNICO\n\nConforme a la Ley No. 172-13 sobre Protección de Datos de Carácter Personal en República Dominicana:\n\n1. Recolección de datos: Se recolecta nombre, cédula, correo, teléfono y dirección de los clientes con el único propósito de gestionar los servicios de reparación de vehículos, presupuestos y facturación.\n2. Trazabilidad: Todo acceso y modificación de datos queda debidamente auditado en el registro interno.\n3. Derechos ARCO: Los titulares de los datos pueden ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición solicitando el trámite en administración (Ley 133-21).\n4. Cifrado: Los datos sensibles de clientes se almacenan de forma cifrada en la base de datos para impedir accesos no autorizados.`

  const cargarLogs = async () => {
    setLoadingLogs(true)
    try {
      let query = `?limite=${limiteLogs}`
      if (filtroEntidad) query += `&entidad=${filtroEntidad}`
      if (filtroUsuario) query += `&usuarioId=${filtroUsuario}`
      const res = await api.get(`/log-actividad${query}`)
      setLogs(res.data.data || [])
    } catch {
      toast.show('Error al cargar auditoría.', 'error')
    } finally {
      setLoadingLogs(false)
    }
  }

  const handleGuardarConsentimiento = async (e) => {
    e.preventDefault()
    if (!clienteSeleccionado) {
      toast.show('Debe seleccionar un cliente.', 'error')
      return
    }
    try {
      setLoading(true)
      await guardarConsentimiento({
        clienteId: clienteSeleccionado,
        tipo: consentimientoTipo,
        otorgado: consentimientoOtorgado,
        observacion: consentimientoObs
      })
      toast.show('Consentimiento actualizado correctamente.', 'success')
      setConsentimientoObs('')
      fetchConsentimientos()
    } catch {
      toast.show('Error al registrar consentimiento.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCrearSolicitudArco = async (e) => {
    e.preventDefault()
    if (!arcoClienteId || !arcoDescripcion) {
      toast.show('Debe seleccionar el cliente y escribir una descripción.', 'error')
      return
    }
    try {
      setLoading(true)
      await crearSolicitud({
        clienteId: arcoClienteId,
        tipo: arcoTipo,
        descripcion: arcoDescripcion
      })
      toast.show('Solicitud ARCO registrada exitosamente.', 'success')
      setArcoDescripcion('')
      fetchSolicitudes()
    } catch {
      toast.show('Error al registrar la solicitud.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResolverArco = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await actualizarEstadoSolicitud(arcoResolviendoId, arcoNuevoEstado, arcoRespuestaText)
      toast.show('Solicitud ARCO resuelta correctamente.', 'success')
      setArcoResolviendoId(null)
      setArcoRespuestaText('')
      fetchSolicitudes()
    } catch {
      toast.show('Error al resolver la solicitud.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const aplicarContraste = (val) => {
    setAltoContraste(val)
    localStorage.setItem('accesibilidad-contraste', val)
    document.documentElement.classList.toggle('high-contrast', val)
  }

  const aplicarTamanioTexto = (size) => {
    setTamanioTexto(size)
    localStorage.setItem('accesibilidad-texto', size)
    document.documentElement.classList.remove('text-lg-accessible', 'text-xl-accessible')
    if (size === 'lg') document.documentElement.classList.add('text-lg-accessible')
    if (size === 'xl') document.documentElement.classList.add('text-xl-accessible')
  }

  const toggleWcag = (key) => {
    const nuevo = { ...checklistWcag, [key]: !checklistWcag[key] }
    setChecklistWcag(nuevo)
    localStorage.setItem('checklist-wcag', JSON.stringify(nuevo))
  }

  const wcagScore = Math.round((Object.values(checklistWcag).filter(Boolean).length / Object.keys(checklistWcag).length) * 100)

  // Canvas Drawing Logic
  const getXY = (e, rect) => {
    const src = e.touches ? e.touches[0] : e
    return {
      x: src.clientX - rect.left,
      y: src.clientY - rect.top
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const { x, y } = getXY(e, rect)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
    setHasDrawn(true)
  }

  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const { x, y } = getXY(e, rect)
    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#1E293B'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const limpiarCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const handleGuardarFirma = async (e) => {
    e.preventDefault()
    if (!firmanteNombre || !firmaEntidadId || !hasDrawn) {
      toast.show('El nombre, la ID del documento y la firma en el recuadro son requeridos.', 'error')
      return
    }
    try {
      setLoading(true)
      const dataUrl = canvasRef.current.toDataURL('image/png')
      await guardarFirma({
        entidad: firmaEntidad,
        entidadId: firmaEntidadId,
        firmante: firmanteNombre,
        imagenBase64: dataUrl
      })
      toast.show('Firma digital guardada y enlazada correctamente.', 'success')
      limpiarCanvas()
      setFirmanteNombre('')
      setFirmaEntidadId('')
      fetchFirmas()
    } catch {
      toast.show('Error al registrar firma digital.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const guardarPolitica = async () => {
    try {
      setLoading(true)
      await patchConfig({ politica_privacidad: politicaTexto })
      toast.show('Política de privacidad interna guardada.', 'success')
    } catch {
      toast.show('Error al guardar la política de privacidad.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 h-full flex flex-col pb-8">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-brand-primary" />
            Marco Legal y Ético
          </h2>
          <p className="text-gray-500 mt-1">Cumplimiento normativo y control ético del taller (Leyes 172-13, 133-21, 53-07 y 126-02 RD).</p>
        </div>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-gray-200 overflow-x-auto space-x-1 scrollbar-hide flex-shrink-0">
        {[
          { id: 'auditoria', label: 'Auditoría', icon: FileSpreadsheet },
          { id: 'privacidad', label: 'Consentimientos', icon: Lock },
          { id: 'arco', label: 'Derechos ARCO', icon: Scale },
          { id: 'accesibilidad', label: 'Accesibilidad', icon: Accessibility },
          { id: 'roles', label: 'Roles y Permisos', icon: UserCog },
          { id: 'cumplimiento', label: 'Cumplimiento Legal', icon: Gavel },
          { id: 'firma', label: 'Firma Digital', icon: PenLine }
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                active 
                  ? 'border-brand-primary text-brand-primary' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'arco' && solicitudes.filter(s => s.estado === 'PENDIENTE').length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                  {solicitudes.filter(s => s.estado === 'PENDIENTE').length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      <div className="flex-1">

        {/* 1. AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div className="space-y-4">
            
            {/* Filtros */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-150 shadow-sm">
              <div className="flex flex-wrap gap-2">
                <select 
                  value={filtroEntidad} 
                  onChange={e => setFiltroEntidad(e.target.value)}
                  className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Todos los Módulos</option>
                  <option value="ORDEN">Órdenes</option>
                  <option value="CLIENTE">Clientes</option>
                  <option value="FACTURA">Facturas</option>
                  <option value="USUARIO">Usuarios</option>
                </select>

                <select 
                  value={filtroUsuario} 
                  onChange={e => setFiltroUsuario(e.target.value)}
                  className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="">Todos los Usuarios</option>
                  {usuariosSistema.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                  ))}
                </select>

                <select 
                  value={limiteLogs} 
                  onChange={e => setLimiteLogs(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value={50}>Últimos 50 logs</option>
                  <option value={100}>Últimos 100 logs</option>
                  <option value={200}>Últimos 200 logs</option>
                </select>
              </div>

              <button 
                onClick={cargarLogs}
                className="btn-secondary text-xs flex items-center gap-1.5 py-1.5 px-3"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                Refrescar
              </button>
            </div>

            {/* Tabla de Logs */}
            <div className="card bg-white shadow-sm rounded-2xl border border-gray-150 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Entidad</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Detalle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {loadingLogs ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-400">Cargando registros...</td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-400">No se encontraron registros de auditoría.</td>
                      </tr>
                    ) : (
                      logs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                            {new Date(log.creadoEn).toLocaleString('es-DO')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {log.usuarioNombre}
                            <span className="ml-2 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-normal uppercase">
                              {log.usuarioRol}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                              log.accion === 'CREAR' ? 'bg-green-50 text-green-700 border border-green-200' :
                              log.accion === 'ACTUALIZAR' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              log.accion === 'ELIMINAR' ? 'bg-red-50 text-red-700 border border-red-200' :
                              'bg-gray-50 text-gray-700 border border-gray-200'
                            }`}>
                              {log.accion}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-500">
                            {log.entidad}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate" title={log.detalle}>
                            {log.detalle}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. PRIVACIDAD & CONSENTIMIENTOS */}
        {activeTab === 'privacidad' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulario */}
            <form onSubmit={handleGuardarConsentimiento} className="card bg-white p-6 shadow-md rounded-2xl border border-gray-150 space-y-4">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Registrar Consentimiento</h3>
              
              <div className="space-y-1">
                <label className="label-field">Cliente *</label>
                <select 
                  value={clienteSeleccionado} 
                  onChange={e => setClienteSeleccionado(e.target.value)} 
                  required
                  className="input-field"
                >
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-field">Tipo de Consentimiento</label>
                <select 
                  value={consentimientoTipo} 
                  onChange={e => setConsentimientoTipo(e.target.value)}
                  className="input-field"
                >
                  <option value="COMPARTIR_TERCEROS">Compartir datos con Terceros / Aseguradoras</option>
                  <option value="MARKETING">Marketing y Promociones</option>
                  <option value="GENERAL">Tratamiento General de Datos del Taller</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="label-field">Estado</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConsentimientoOtorgado(true)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                      consentimientoOtorgado 
                        ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    OTORGADO
                  </button>
                  <button
                    type="button"
                    onClick={() => setConsentimientoOtorgado(false)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                      !consentimientoOtorgado 
                        ? 'bg-red-500 border-red-500 text-white shadow-sm' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    REVOCADO
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="label-field">Notas / Observación</label>
                <textarea 
                  value={consentimientoObs} 
                  onChange={e => setConsentimientoObs(e.target.value)}
                  className="input-field h-20 resize-none"
                  placeholder="Detalles sobre el consentimiento..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </form>

            {/* Listado */}
            <div className="lg:col-span-2 card bg-white p-6 shadow-md rounded-2xl border border-gray-150">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2 mb-4">Historial de Consentimientos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Modificado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {consentimientos.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-400">No hay registros.</td>
                      </tr>
                    ) : (
                      consentimientos.map(c => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{c.cliente?.nombre || '—'}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {c.tipo === 'COMPARTIR_TERCEROS' ? 'Aseguradoras / Terceros' : c.tipo === 'MARKETING' ? 'Marketing' : 'General'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              c.otorgado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {c.otorgado ? 'OTORGADO' : 'REVOCADO'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{new Date(c.actualizadoEn).toLocaleDateString('es-DO')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. DERECHOS ARCO */}
        {activeTab === 'arco' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Formulario */}
            <form onSubmit={handleCrearSolicitudArco} className="card bg-white p-6 shadow-md rounded-2xl border border-gray-150 space-y-4">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2">Registrar Solicitud</h3>
              
              <div className="space-y-1">
                <label className="label-field">Cliente Solicitante *</label>
                <select 
                  value={arcoClienteId} 
                  onChange={e => setArcoClienteId(e.target.value)} 
                  required
                  className="input-field"
                >
                  <option value="">Seleccione cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-field">Derecho Solicitado</label>
                <select 
                  value={arcoTipo} 
                  onChange={e => setArcoTipo(e.target.value)}
                  className="input-field"
                >
                  <option value="ACCESO">ACCESO (Ver todos sus datos)</option>
                  <option value="RECTIFICACION">RECTIFICACIÓN (Corregir datos)</option>
                  <option value="CANCELACION">CANCELACIÓN (Borrar expediente)</option>
                  <option value="OPOSICION">OPOSICIÓN (No compartir/no spam)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="label-field">Petición / Descripción *</label>
                <textarea 
                  value={arcoDescripcion} 
                  onChange={e => setArcoDescripcion(e.target.value)} 
                  required
                  rows={4}
                  className="input-field resize-none"
                  placeholder="Detalles sobre qué información solicita acceder o rectificar..."
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Crear Petición
              </button>
            </form>

            {/* Listado */}
            <div className="lg:col-span-2 space-y-3">
              {solicitudes.length === 0 ? (
                <div className="card bg-white p-10 text-center border border-gray-150 text-gray-400">
                  No hay solicitudes de derechos ARCO registradas.
                </div>
              ) : (
                solicitudes.map(sol => (
                  <div key={sol.id} className="card bg-white p-5 border border-gray-150 shadow-sm flex flex-col space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-sm">{sol.cliente?.nombre || '—'}</span>
                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono border">
                          {sol.tipo}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ARCO_ESTADOS[sol.estado]?.color || 'bg-gray-100'
                      }`}>
                        {ARCO_ESTADOS[sol.estado]?.label || sol.estado}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm">{sol.descripcion}</p>

                    {sol.respuesta && (
                      <div className="bg-gray-50 border p-3 rounded-lg text-xs text-gray-700">
                        <span className="font-semibold block text-gray-500 mb-0.5">Respuesta oficial:</span>
                        {sol.respuesta}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                      <span>Registrado: {new Date(sol.creadoEn).toLocaleDateString('es-DO')}</span>
                      
                      {sol.estado !== 'COMPLETADA' && sol.estado !== 'RECHAZADA' && (
                        <button
                          onClick={() => {
                            setArcoResolviendoId(sol.id)
                            setArcoRespuestaText(sol.respuesta || '')
                          }}
                          className="text-brand-primary font-semibold hover:underline"
                        >
                          Resolver Caso
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Resolver Caso */}
            {arcoResolviendoId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md border shadow-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-gray-800">Responder Caso ARCO</h3>
                    <button onClick={() => setArcoResolviendoId(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="label-field">Estado de Resolución</label>
                      <select 
                        value={arcoNuevoEstado} 
                        onChange={e => setArcoNuevoEstado(e.target.value)}
                        className="input-field"
                      >
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="COMPLETADA">Completado / Aprobado</option>
                        <option value="RECHAZADA">Rechazado</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="label-field">Respuesta Oficial *</label>
                      <textarea 
                        value={arcoRespuestaText} 
                        onChange={e => setArcoRespuestaText(e.target.value)}
                        required
                        rows={4}
                        className="input-field resize-none text-sm"
                        placeholder="Acción tomada para resolver la petición..."
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button 
                        type="button" 
                        onClick={() => setArcoResolviendoId(null)}
                        className="btn-secondary py-1.5 text-xs"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleResolverArco}
                        className="btn-primary py-1.5 text-xs"
                      >
                        Guardar Resolución
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. ACCESIBILIDAD */}
        {activeTab === 'accesibilidad' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Controles */}
            <div className="card bg-white p-6 shadow-md rounded-2xl border border-gray-150 space-y-6">
              <h3 className="font-bold text-gray-800 border-b pb-2">Configuración Visual</h3>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700 text-sm block">Modo Alto Contraste</span>
                  <span className="text-xs text-gray-400">Optimiza colores para legibilidad.</span>
                </div>
                <button 
                  onClick={() => aplicarContraste(!altoContraste)}
                  className={`w-12 h-6 rounded-full p-0.5 transition ${altoContraste ? 'bg-brand-primary' : 'bg-gray-200'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${altoContraste ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                <span className="font-medium text-gray-700 text-sm block">Escala de Texto</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'base', label: 'Normal' },
                    { id: 'lg', label: 'Grande' },
                    { id: 'xl', label: 'Muy Grande' }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => aplicarTamanioTexto(s.id)}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        tamanioTexto === s.id ? 'bg-brand-primary border-brand-primary text-white shadow-sm' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="card bg-white p-6 shadow-md rounded-2xl border border-gray-150 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="font-bold text-gray-800">Verificación WCAG 2.1</h3>
                <span className="text-xs text-brand-primary font-bold">{wcagScore}% Criterios</span>
              </div>

              <div className="space-y-2">
                {[
                  { key: 'contrasteTexto', label: 'Contraste texto/fondo mínimo 4.5:1' },
                  { key: 'navegacionTeclado', label: 'Navegación completa por teclado (Tabulator)' },
                  { key: 'lectoresPantalla', label: 'Labels descriptivos en todos los inputs' },
                  { key: 'textosAlternativos', label: 'Textos alternativos en imágenes del sistema' },
                  { key: 'formulariosEtiquetados', label: 'Respuestas de error legibles por voz' },
                ].map(wcag => (
                  <div 
                    key={wcag.key}
                    onClick={() => toggleWcag(wcag.key)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition text-sm text-gray-700"
                  >
                    <input 
                      type="checkbox" 
                      checked={checklistWcag[wcag.key]}
                      onChange={() => {}} // Manejado por onClick
                      className="rounded text-brand-primary focus:ring-brand-primary"
                    />
                    <span>{wcag.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. ROLES Y PERMISOS */}
        {activeTab === 'roles' && (
          <div className="card bg-white shadow-md rounded-2xl border border-gray-150 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-center">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Módulo / Vista</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">MECÁNICO</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">RECEPCIONISTA</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">CAJERO</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">ADMINISTRADOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                  {[
                    { m: 'Clientes', me: 'Lectura', re: 'Ver/Registrar', ca: 'Lectura', ad: 'Control Total' },
                    { m: 'Vehículos', me: 'Lectura', re: 'Ver/Registrar', ca: 'Lectura', ad: 'Control Total' },
                    { m: 'Órdenes de Servicio', me: 'Avanzar estado', re: 'Crear/Editar', ca: 'Lectura', ad: 'Control Total' },
                    { m: 'Facturación / Comprobantes', me: 'Sin Acceso', re: 'Lectura', ca: 'Cobrar/Facturar', ad: 'Control Total' },
                    { m: 'Configuración de Sistema', me: 'Sin Acceso', re: 'Sin Acceso', ca: 'Sin Acceso', ad: 'Control Total' },
                    { m: 'Auditoría / Logs', me: 'Sin Acceso', re: 'Sin Acceso', ca: 'Sin Acceso', ad: 'Control Total' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-left font-bold text-gray-800">{row.m}</td>
                      <td className="px-4 py-4 text-xs font-mono text-gray-500">{row.me}</td>
                      <td className="px-4 py-4 text-xs text-brand-primary font-semibold">{row.re}</td>
                      <td className="px-4 py-4 text-xs text-green-700 font-semibold">{row.ca}</td>
                      <td className="px-4 py-4 text-xs font-bold text-amber-700">{row.ad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. CUMPLIMIENTO LEGAL */}
        {activeTab === 'cumplimiento' && (
          <div className="card bg-white p-6 shadow-md rounded-2xl border border-gray-150 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-gray-800">Política de Privacidad del Taller</h3>
              <button onClick={guardarPolitica} disabled={loading} className="btn-primary flex items-center gap-1 py-1.5 text-xs">
                <Save className="w-4 h-4" />
                Guardar Política
              </button>
            </div>
            
            <textarea 
              value={politicaTexto} 
              onChange={e => setPoliticaTexto(e.target.value)}
              rows={12}
              className="w-full border rounded-lg p-3 text-sm font-mono leading-relaxed bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        )}

        {/* 7. FIRMA DIGITAL */}
        {activeTab === 'firma' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Form y Canvas */}
            <form onSubmit={handleGuardarFirma} className="lg:col-span-2 card bg-white p-6 shadow-md rounded-2xl border border-gray-150 space-y-4">
              <h3 className="font-bold text-gray-800 border-b pb-2">Capturar Firma</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="label-field">Tipo Documento</label>
                  <select 
                    value={firmaEntidad} 
                    onChange={e => setFirmaEntidad(e.target.value)}
                    className="input-field"
                  >
                    <option value="CONSENTIMIENTO">Consentimiento</option>
                    <option value="ORDEN">Orden de Servicio</option>
                    <option value="FACTURA">Factura</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="label-field">ID de Referencia *</label>
                  <input 
                    type="text" 
                    value={firmaEntidadId} 
                    onChange={e => setFirmaEntidadId(e.target.value)}
                    required
                    placeholder="Ej. UUID de la orden..."
                    className="input-field font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="label-field">Nombre del Firmante *</label>
                  <input 
                    type="text" 
                    value={firmanteNombre} 
                    onChange={e => setFirmanteNombre(e.target.value)}
                    required
                    placeholder="Ej. Carlos Pérez"
                    className="input-field"
                  />
                </div>
              </div>

              {/* Recuadro de dibujo */}
              <div className="space-y-1">
                <span className="label-field">Dibuje la firma dentro del recuadro *</span>
                <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full cursor-crosshair bg-white"
                    style={{ height: '180px' }}
                  />
                  <button 
                    type="button" 
                    onClick={limpiarCanvas}
                    className="absolute bottom-2 right-2 text-xs bg-gray-100 hover:bg-gray-200 border text-gray-600 font-bold px-2 py-1 rounded"
                  >
                    Limpiar Lienzo
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading || !hasDrawn} 
                className="btn-primary w-full flex items-center justify-center gap-1.5"
              >
                <PenLine className="w-4 h-4" />
                Registrar Firma Digital
              </button>
            </form>

            {/* Listado en Expediente */}
            <div className="card bg-white p-6 shadow-md rounded-2xl border border-gray-150 flex flex-col">
              <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2 mb-3">Expediente de Firmas</h3>
              
              <div className="space-y-3 overflow-y-auto max-h-[360px] flex-1 pr-1">
                {firmas.length === 0 ? (
                  <div className="text-center text-gray-400 py-8 text-xs">
                    No hay firmas electrónicas registradas.
                  </div>
                ) : (
                  firmas.map(f => (
                    <div key={f.id} className="p-3 border rounded-xl bg-gray-50 flex flex-col space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700">{f.firmante}</span>
                        <span className="bg-white border text-[10px] text-gray-500 px-1.5 py-0.2 rounded font-mono">
                          {f.entidad}
                        </span>
                      </div>
                      
                      <div className="bg-white border rounded p-1.5 flex items-center justify-center">
                        <img src={f.imagenBase64} alt="Firma" className="h-9 object-contain" />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>Autorizó: {f.usuario?.nombre}</span>
                        <span>{new Date(f.creadoEn).toLocaleDateString('es-DO')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
