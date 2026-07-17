import { useState, useEffect, useRef } from 'react'
import { 
  Shield, 
  FileText, 
  Lock, 
  Accessibility, 
  Users, 
  CheckSquare, 
  Scale, 
  PenLine, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Eye, 
  Plus, 
  X,
  Save,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import { useAuthStore } from '../store/authStore'
import { useClienteStore } from '../store/clienteStore'
import { useConsentimientoStore } from '../store/consentimientoStore'
import { useSolicitudArcoStore } from '../store/solicitudArcoStore'
import { useFirmaStore } from '../store/firmaStore'
import { useConfigStore } from '../store/configStore'

export default function MarcoLegal() {
  const toast = useToast()
  const { user } = useAuthStore()
  
  // Stores
  const { clientes, fetchClientes } = useClienteStore()
  const { consentimientos, fetchConsentimientos, guardarConsentimiento } = useConsentimientoStore()
  const { solicitudes, fetchSolicitudes, crearSolicitud, actualizarEstadoSolicitud } = useSolicitudArcoStore()
  const { firmas, fetchFirmas, guardarFirma, fetchFirmasEntidad } = useFirmaStore()
  const { config, patchConfig } = useConfigStore()

  // Tabs: auditoria | privacidad | arco | accesibilidad | roles | cumplimiento | firma
  const [activeTab, setActiveTab] = useState('auditoria')

  // Estados generales
  const [loading, setLoading] = useState(false)

  // 1. Auditoría
  const [logs, setLogs] = useState([])
  const [filtroEntidad, setFiltroEntidad] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [limiteLogs, setLimiteLogs] = useState(50)
  const [usuariosSistema, setUsuariosSistema] = useState([])

  // 2. Privacidad y Consentimiento
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [consentimientoTipo, setConsentimientoTipo] = useState('COMPARTIR_TERCEROS')
  const [consentimientoOtorgado, setConsentimientoOtorgado] = useState(true)
  const [consentimientoObs, setConsentimientoObs] = useState('')

  // 3. Solicitudes ARCO
  const [arcoClienteId, setArcoClienteId] = useState('')
  const [arcoTipo, setArcoTipo] = useState('ACCESO')
  const [arcoDescripcion, setArcoDescripcion] = useState('')
  const [arcoRespuestaText, setArcoRespuestaText] = useState('')
  const [arcoResolviendoId, setArcoResolviendoId] = useState(null)
  const [arcoNuevoEstado, setArcoNuevoEstado] = useState('COMPLETADA')

  // 4. Accesibilidad (Persistido localmente)
  const [altoContraste, setAltoContraste] = useState(() => {
    return localStorage.getItem('accesibilidad-contraste') === 'true'
  })
  const [tamanioTexto, setTamanioTexto] = useState(() => {
    return localStorage.getItem('accesibilidad-texto') || 'base'
  })
  // Checklist WCAG
  const [checklistWcag, setChecklistWcag] = useState(() => {
    const guardado = localStorage.getItem('checklist-wcag')
    return guardado ? JSON.parse(guardado) : {
      contrasteTexto: true,
      navegacionTeclado: false,
      lectoresPantalla: false,
      textosAlternativos: true,
      formulariosEtiquetados: false
    }
  })

  // 6. Cumplimiento Legal (Política de privacidad)
  const [politicaTexto, setPoliticaTexto] = useState('')

  // 7. Firma Digital (Canvas)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [firmanteNombre, setFirmanteNombre] = useState('')
  const [firmaEntidad, setFirmaEntidad] = useState('CONSENTIMIENTO')
  const [firmaEntidadId, setFirmaEntidadId] = useState('')
  const [firmaImagenPreview, setFirmaImagenPreview] = useState(null)

  // Cargar datos iniciales
  useEffect(() => {
    fetchClientes()
    cargarUsuarios()
    cargarPolitica()
  }, [])

  useEffect(() => {
    if (activeTab === 'auditoria') {
      cargarLogs()
    } else if (activeTab === 'privacidad') {
      fetchConsentimientos()
    } else if (activeTab === 'arco') {
      fetchSolicitudes()
    } else if (activeTab === 'firma') {
      fetchFirmas()
    }
  }, [activeTab, filtroEntidad, filtroUsuario, limiteLogs])

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuariosSistema(res.data.data || [])
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  const cargarPolitica = async () => {
    try {
      const res = await api.get('/configuracion')
      const configs = res.data.data || []
      const pol = configs.find(c => c.clave === 'politica_privacidad')
      if (pol) {
        setPoliticaTexto(pol.valor)
      } else {
        setPoliticaTexto('POLÍTICA DE PRIVACIDAD INTERNA — SIGEST TALLER MECÁNICO\n\nConforme a la Ley No. 172-13 sobre Protección de Datos de Carácter Personal en República Dominicana:\n\n1. Recolección de datos: Se recolecta nombre, cédula, correo, teléfono y dirección de los clientes con el único propósito de gestionar los servicios de reparación de vehículos, presupuestos y facturación.\n2. Trazabilidad: Todo acceso y modificación de datos queda debidamente auditado en el registro interno.\n3. Derechos ARCO: Los titulares de los datos pueden ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición solicitando el trámite en administración (Ley 133-21).\n4. Cifrado: Los datos sensibles de clientes se almacenan de forma cifrada en la base de datos para impedir accesos no autorizados.')
      }
    } catch (error) {
      console.error(error)
    }
  }

  const guardarPolitica = async () => {
    try {
      setLoading(true)
      await patchConfig({ politica_privacidad: politicaTexto })
      toast.show('Política de privacidad actualizada exitosamente.', 'success')
    } catch (error) {
      toast.show('Error al guardar la política de privacidad.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const cargarLogs = async () => {
    try {
      setLoading(true)
      let query = `?limite=${limiteLogs}`
      if (filtroEntidad) query += `&entidad=${filtroEntidad}`
      if (filtroUsuario) query += `&usuarioId=${filtroUsuario}`
      
      const res = await api.get(`/log-actividad${query}`)
      setLogs(res.data.data || [])
    } catch (error) {
      toast.show('Error al cargar el registro de auditoría.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Guardar consentimiento
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
    } catch (error) {
      toast.show('Error al registrar consentimiento.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Guardar solicitud ARCO
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
    } catch (error) {
      toast.show('Error al registrar solicitud ARCO.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Responder/Resolver solicitud ARCO
  const handleResolverArco = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await actualizarEstadoSolicitud(arcoResolviendoId, arcoNuevoEstado, arcoRespuestaText)
      toast.show('Solicitud ARCO actualizada exitosamente.', 'success')
      setArcoResolviendoId(null)
      setArcoRespuestaText('')
      fetchSolicitudes()
    } catch (error) {
      toast.show('Error al actualizar la solicitud.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Manejo de accesibilidad local
  const aplicarContraste = (val) => {
    setAltoContraste(val)
    localStorage.setItem('accesibilidad-contraste', val)
    if (val) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  const aplicarTamanioTexto = (size) => {
    setTamanioTexto(size)
    localStorage.setItem('accesibilidad-texto', size)
    // Quitar clases previas
    document.documentElement.classList.remove('text-sm-accessible', 'text-lg-accessible', 'text-xl-accessible')
    if (size === 'lg') {
      document.documentElement.classList.add('text-lg-accessible')
    } else if (size === 'xl') {
      document.documentElement.classList.add('text-xl-accessible')
    }
  }

  const toggleWcag = (key) => {
    const nuevo = { ...checklistWcag, [key]: !checklistWcag[key] }
    setChecklistWcag(nuevo)
    localStorage.setItem('checklist-wcag', JSON.stringify(nuevo))
  }

  // Lógica Canvas de Firma
  const startDrawing = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    // Soporte táctil y ratón
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()

    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#020617' // Slate 950 para contraste puro
    ctx.lineWidth = 2.5
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
  }

  const handleGuardarFirmaDigital = async (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas || !firmanteNombre || !firmaEntidadId) {
      toast.show('Por favor llene el nombre del firmante, ID de la entidad y firme el canvas.', 'error')
      return
    }

    try {
      setLoading(true)
      const dataUrl = canvas.toDataURL('image/png')
      await guardarFirma({
        entidad: firmaEntidad,
        entidadId: firmaEntidadId,
        firmante: firmanteNombre,
        imagenBase64: dataUrl
      })

      toast.show('Firma digital almacenada y enlazada al expediente.', 'success')
      limpiarCanvas()
      setFirmanteNombre('')
      setFirmaEntidadId('')
      fetchFirmas()
    } catch (error) {
      toast.show('Error al guardar la firma digital.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in">
      
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Marco Legal y Ético
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Cumplimiento normativo dominicano (Leyes 172-13, 133-21, 53-07 y 126-02 RD) y principios éticos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 scrollbar-hide">
        {[
          { id: 'auditoria', label: 'Auditoría', icon: FileSpreadsheet },
          { id: 'privacidad', label: 'Privacidad y Consentimientos', icon: Lock },
          { id: 'arco', label: 'Derechos ARCO', icon: Scale },
          { id: 'accesibilidad', label: 'Accesibilidad WCAG', icon: Accessibility },
          { id: 'roles', label: 'Roles y Permisos', icon: Users },
          { id: 'cumplimiento', label: 'Cumplimiento Legal', icon: FileText },
          { id: 'firma', label: 'Firma Digital', icon: PenLine },
        ].map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                active 
                  ? 'bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 text-teal-600 dark:text-teal-400 border-2 border-teal-500/20' 
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Contenido de la Tab */}
      <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-6 md:p-8">
        
        {/* 1. AUDITORÍA */}
        {activeTab === 'auditoria' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Registro de Auditoría de Actividad (Ley 53-07 RD)
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Trazabilidad e inmutabilidad de acciones sensibles ejecutadas en el taller.
                </p>
              </div>

              {/* Controles de Filtro */}
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={filtroEntidad}
                  onChange={(e) => setFiltroEntidad(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  <option value="">Todas las Entidades</option>
                  <option value="ORDEN">Órdenes</option>
                  <option value="CLIENTE">Clientes</option>
                  <option value="FACTURA">Facturas</option>
                  <option value="USUARIO">Usuarios</option>
                </select>

                <select
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  <option value="">Todos los Usuarios</option>
                  {usuariosSistema.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre} ({u.rol})</option>
                  ))}
                </select>

                <select
                  value={limiteLogs}
                  onChange={(e) => setLimiteLogs(Number(e.target.value))}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                >
                  <option value={50}>Últimos 50 logs</option>
                  <option value={100}>Últimos 100 logs</option>
                  <option value={200}>Últimos 200 logs</option>
                </select>

                <button
                  onClick={cargarLogs}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Tabla de Logs */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3">Fecha y Hora</th>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Acción</th>
                    <th className="px-4 py-3">Módulo afectado</th>
                    <th className="px-4 py-3">Detalle del Evento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                        {loading ? 'Cargando registros...' : 'No se encontraron registros de auditoría.'}
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                          {new Date(log.creadoEn).toLocaleString('es-DO')}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {log.usuarioNombre}
                          <span className="ml-2 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500 font-normal">
                            {log.usuarioRol}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block ${
                            log.accion === 'CREAR' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            log.accion === 'ACTUALIZAR' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                            log.accion === 'ELIMINAR' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                            'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {log.accion}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                          {log.entidad}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-xs md:max-w-md truncate" title={log.detalle}>
                          {log.detalle}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. PRIVACIDAD Y CONSENTIMIENTOS */}
        {activeTab === 'privacidad' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Consentimientos y Privacidad (Ley 172-13 RD)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Garantice el derecho del cliente a autorizar el uso de sus datos para aseguradoras o marketing.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Formulario de Consentimiento */}
              <form onSubmit={handleGuardarConsentimiento} className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Nuevo Consentimiento</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente</label>
                  <select
                    value={clienteSeleccionado}
                    onChange={(e) => setClienteSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="">Seleccione un Cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (Céd: {c.cedula || 'N/A'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Consentimiento</label>
                  <select
                    value={consentimientoTipo}
                    onChange={(e) => setConsentimientoTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="COMPARTIR_TERCEROS">Compartir datos con Terceros / Aseguradoras</option>
                    <option value="MARKETING">Marketing y Promociones</option>
                    <option value="GENERAL">Tratamiento General de Datos del Taller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">Estado</label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setConsentimientoOtorgado(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        consentimientoOtorgado 
                          ? 'bg-emerald-500 text-white border-emerald-500' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      OTORGADO
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentimientoOtorgado(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        !consentimientoOtorgado 
                          ? 'bg-rose-500 text-white border-rose-500' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      REVOCADO
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Notas / Observación</label>
                  <textarea
                    value={consentimientoObs}
                    onChange={(e) => setConsentimientoObs(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm h-20"
                    placeholder="Ej. Otorgado verbalmente en recepción..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  Guardar Consentimiento
                </button>
              </form>

              {/* Listado de Consentimientos */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Historial Registrado</h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="px-4 py-3">Cliente</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Última actualización</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                      {consentimientos.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-4 py-8 text-center text-slate-400">
                            No hay consentimientos registrados en este momento.
                          </td>
                        </tr>
                      ) : (
                        consentimientos.map(c => (
                          <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                            <td className="px-4 py-3 font-medium">
                              {c.cliente?.nombre || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                              {c.tipo === 'COMPARTIR_TERCEROS' ? 'Compartir con Aseguradoras' : c.tipo}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                c.otorgado 
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                              }`}>
                                {c.otorgado ? 'OTORGADO' : 'REVOCADO'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                              {new Date(c.actualizadoEn).toLocaleString('es-DO')}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 3. SOLICITUDES ARCO */}
        {activeTab === 'arco' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Gestión de Derechos ARCO (Ley 133-21 RD)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Atienda solicitudes de Acceso, Rectificación, Cancelación y Oposición a los datos por parte de los clientes titulares.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Formulario de registro de Solicitud */}
              <form onSubmit={handleCrearSolicitudArco} className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Registrar Solicitud</h3>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Cliente Solicitante</label>
                  <select
                    value={arcoClienteId}
                    onChange={(e) => setArcoClienteId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="">Seleccione un Cliente...</option>
                    {clientes.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} (Céd: {c.cedula || 'N/A'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Derecho Solicitado</label>
                  <select
                    value={arcoTipo}
                    onChange={(e) => setArcoTipo(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  >
                    <option value="ACCESO">ACCESO (Ver todos sus datos guardados)</option>
                    <option value="RECTIFICACION">RECTIFICACIÓN (Modificar datos erróneos)</option>
                    <option value="CANCELACION">CANCELACIÓN / SUPRESIÓN (Borrar expediente)</option>
                    <option value="OPOSICION">OPOSICIÓN (No enviar emails ni publicidad)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Detalle de la Petición</label>
                  <textarea
                    value={arcoDescripcion}
                    onChange={(e) => setArcoDescripcion(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm h-28 font-sans"
                    placeholder="Ej. Solicita rectificar su número de cédula porque tiene un dígito incorrecto..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  <Plus className="w-4 h-4" />
                  Registrar Solicitud
                </button>
              </form>

              {/* Lista de Solicitudes ARCO */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Historial de Derechos ARCO</h3>

                <div className="space-y-3">
                  {solicitudes.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl">
                      No hay solicitudes registradas en este momento.
                    </div>
                  ) : (
                    solicitudes.map(sol => (
                      <div key={sol.id} className="p-4 border border-slate-200 dark:border-slate-800/80 rounded-2xl hover:shadow-sm transition bg-white dark:bg-slate-900/40">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {sol.cliente?.nombre || 'Cliente N/A'}
                            </span>
                            <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded text-xs font-mono font-bold">
                              {sol.tipo}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              sol.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' :
                              sol.estado === 'EN_PROCESO' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                              sol.estado === 'COMPLETADA' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                              'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}>
                              {sol.estado}
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                          {sol.descripcion}
                        </p>

                        {sol.respuesta && (
                          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-xs mb-3">
                            <span className="font-semibold block text-slate-500 mb-1">Respuesta de la Administración:</span>
                            {sol.respuesta}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Registrada el: {new Date(sol.creadoEn).toLocaleDateString('es-DO')}</span>
                          
                          {sol.estado !== 'COMPLETADA' && sol.estado !== 'RECHAZADA' && (
                            <button
                              onClick={() => {
                                setArcoResolviendoId(sol.id)
                                setArcoRespuestaText(sol.respuesta || '')
                              }}
                              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition"
                            >
                              Resolver
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal para Resolver Solicitud ARCO */}
            {arcoResolviendoId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-scale-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Responder Solicitud</h3>
                    <button onClick={() => setArcoResolviendoId(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleResolverArco} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Estado de la Solicitud</label>
                      <select
                        value={arcoNuevoEstado}
                        onChange={(e) => setArcoNuevoEstado(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-sm"
                      >
                        <option value="EN_PROCESO">EN PROCESO</option>
                        <option value="COMPLETADA">COMPLETADA / APROBADA</option>
                        <option value="RECHAZADA">RECHAZADA</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Respuesta oficial al cliente</label>
                      <textarea
                        value={arcoRespuestaText}
                        onChange={(e) => setArcoRespuestaText(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-xl text-sm h-32"
                        placeholder="Describa la acción tomada. Ej. 'Se modificó la cédula del cliente al valor solicitado en fecha 17/07/2026'..."
                        required
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setArcoResolviendoId(null)}
                        className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-xl text-sm font-bold hover:from-emerald-600 transition shadow-md"
                      >
                        Guardar Respuesta
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. ACCESIBILIDAD WCAG */}
        {activeTab === 'accesibilidad' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Accesibilidad e Inclusión (Pautas WCAG 2.1)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Adapte la interfaz de SIGEST para personas mayores o con deficiencias visuales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Controles de Apariencia Accesible */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Ajustes Rápidos</h3>

                {/* Alto contraste */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-slate-800 dark:text-slate-200 text-sm block">Modo de Alto Contraste</label>
                    <span className="text-xs text-slate-500">Aumenta el contraste de texto y bordes para mayor legibilidad.</span>
                  </div>
                  <button
                    onClick={() => aplicarContraste(!altoContraste)}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${
                      altoContraste ? 'bg-teal-500' : 'bg-slate-350 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                      altoContraste ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                {/* Tamaño de texto */}
                <div>
                  <label className="font-semibold text-slate-800 dark:text-slate-200 text-sm block mb-1">Tamaño de Texto Ajustable</label>
                  <span className="text-xs text-slate-500 block mb-3">Amplía toda la tipografía de SIGEST.</span>
                  
                  <div className="flex gap-2">
                    {[
                      { id: 'base', label: 'Normal (100%)' },
                      { id: 'lg', label: 'Grande (115%)' },
                      { id: 'xl', label: 'Muy Grande (130%)' }
                    ].map(size => (
                      <button
                        key={size.id}
                        onClick={() => aplicarTamanioTexto(size.id)}
                        className={`flex-1 py-2 border rounded-xl text-xs font-bold transition ${
                          tamanioTexto === size.id
                            ? 'bg-teal-500 border-teal-500 text-white shadow-md'
                            : 'bg-white dark:bg-slate-900 border-slate-200 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Checklist WCAG */}
              <div className="p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  Verificación de Cumplimiento WCAG
                </h3>
                <p className="text-xs text-slate-400">Marque los criterios cumplidos antes de desplegar nuevas pantallas a producción:</p>

                <div className="space-y-3">
                  {[
                    { key: 'contrasteTexto', label: 'Contraste de colores mínimo 4.5:1 en textos' },
                    { key: 'navegacionTeclado', label: 'Formularios navegables con tabulador (Focus visible)' },
                    { key: 'lectoresPantalla', label: 'Uso de etiquetas HTML correctas (Labels en inputs)' },
                    { key: 'textosAlternativos', label: 'Descripciones ALT en imágenes del sistema' },
                    { key: 'formulariosEtiquetados', label: 'Mensajes de error legibles y alertas de voz' },
                  ].map(wcag => (
                    <div
                      key={wcag.key}
                      onClick={() => toggleWcag(wcag.key)}
                      className="flex items-start gap-3 p-2 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={checklistWcag[wcag.key]}
                        onChange={() => {}} // Manejado por onClick de div
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                        {wcag.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 5. ROLES Y PERMISOS */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Matriz de Roles y Permisos (No Discriminación / Equidad)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Los privilegios de acceso están controlados técnicamente por el backend según el rol del usuario.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-center border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-4 text-left">Módulos del Sistema</th>
                    <th className="px-4 py-4">MECÁNICO</th>
                    <th className="px-4 py-4">RECEPCIONISTA</th>
                    <th className="px-4 py-4">CAJERO</th>
                    <th className="px-4 py-4">ADMINISTRADOR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-slate-800 text-sm">
                  {[
                    { modulo: 'Clientes', m: 'Lectura', r: 'Escritura', c: 'Lectura', a: 'Total Control' },
                    { modulo: 'Vehículos', m: 'Lectura', r: 'Escritura', c: 'Lectura', a: 'Total Control' },
                    { modulo: 'Órdenes de Servicio', m: 'Actualizar (Reparar)', r: 'Escritura', c: 'Lectura', a: 'Total Control' },
                    { modulo: 'Facturas / Pagos', m: 'Sin Acceso', r: 'Lectura', c: 'Escritura', a: 'Total Control' },
                    { modulo: 'Módulo de Configuración', m: 'Sin Acceso', r: 'Sin Acceso', r2: 'Sin Acceso', c: 'Sin Acceso', a: 'Total Control' },
                    { modulo: 'Marco Legal / Logs', m: 'Sin Acceso', r: 'Sin Acceso', c: 'Sin Acceso', a: 'Total Control' }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-4 py-4 text-left font-bold text-slate-800 dark:text-slate-200">
                        {row.modulo}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          row.m === 'Sin Acceso' ? 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>{row.m}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded text-xs font-semibold">
                          {row.r}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded text-xs font-semibold">
                          {row.c}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded text-xs font-bold uppercase">
                          {row.a}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200/50 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                <strong>Nota de seguridad:</strong> El sistema bloquea a nivel de backend las peticiones HTTP que no pertenezcan al rol configurado, impidiendo que el software sea manipulado externamente.
              </span>
            </div>
          </div>
        )}

        {/* 6. CUMPLIMIENTO LEGAL */}
        {activeTab === 'cumplimiento' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Políticas de Privacidad del Taller (Ley 172-13 RD)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Texto normativo que rige el uso de datos en el taller mecánico, visible por el personal.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                value={politicaTexto}
                onChange={(e) => setPoliticaTexto(e.target.value)}
                className="w-full h-96 p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 font-mono text-sm leading-relaxed"
                placeholder="Redacte aquí la política de privacidad oficial del taller mecánico..."
              />

              <div className="flex items-center justify-end">
                <button
                  onClick={guardarPolitica}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-md transition"
                >
                  <Save className="w-4.5 h-4.5" />
                  Guardar Política
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. FIRMA DIGITAL */}
        {activeTab === 'firma' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Captura de Firma Digital (Ley 126-02 RD)
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Obtenga la firma del cliente o personal del taller para consentimientos o entrega de vehículos.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Formulario y Lienzo Canvas */}
              <form onSubmit={handleGuardarFirmaDigital} className="lg:col-span-2 space-y-4 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Lienzo de Firma</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nombre Completo del Firmante</label>
                    <input
                      type="text"
                      value={firmanteNombre}
                      onChange={(e) => setFirmanteNombre(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Entidad Relacionada</label>
                    <div className="flex gap-2">
                      <select
                        value={firmaEntidad}
                        onChange={(e) => setFirmaEntidad(e.target.value)}
                        className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                      >
                        <option value="CONSENTIMIENTO">CONSENTIMIENTO</option>
                        <option value="ORDEN">ORDEN</option>
                        <option value="FACTURA">FACTURA</option>
                      </select>

                      <input
                        type="text"
                        value={firmaEntidadId}
                        onChange={(e) => setFirmaEntidadId(e.target.value)}
                        placeholder="UUID o Código"
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Canvas de Dibujo */}
                <div className="relative">
                  <span className="block text-xs font-semibold text-slate-400 mb-1">
                    Dibuje su firma en el recuadro blanco:
                  </span>
                  
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-48 bg-white border-2 border-dashed border-slate-300 rounded-xl cursor-crosshair touch-none"
                  />

                  <button
                    type="button"
                    onClick={limpiarCanvas}
                    className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition"
                  >
                    Borrar Lienzo
                  </button>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold shadow-md transition"
                  >
                    <PenLine className="w-4.5 h-4.5" />
                    Registrar y Almacenar Firma
                  </button>
                </div>
              </form>

              {/* Listado de Firmas Registradas */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Firmas en el Expediente</h3>
                
                <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
                  {firmas.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs">
                      No hay firmas digitales registradas en el sistema.
                    </div>
                  ) : (
                    firmas.map(f => (
                      <div key={f.id} className="p-3 border border-slate-200 dark:border-slate-850 rounded-xl bg-white dark:bg-slate-900/40">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs">{f.firmante}</span>
                          <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[9px] text-slate-500">
                            {f.entidad}: {f.entidadId.substring(0, 8)}...
                          </span>
                        </div>
                        
                        <div className="bg-white border border-slate-150 p-2 rounded-lg mb-2">
                          <img src={f.imagenBase64} alt="Firma digital" className="h-10 mx-auto object-contain" />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>Registró: {f.usuario?.nombre || 'Usuario'}</span>
                          <span>{new Date(f.creadoEn).toLocaleDateString('es-DO')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
