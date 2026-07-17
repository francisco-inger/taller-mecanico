import { useState, useEffect, useRef } from 'react'
import {
  ShieldCheck, FileSpreadsheet, Lock, Scale, Accessibility,
  Users, FileText, PenLine, RefreshCw, AlertCircle, CheckCircle2,
  Plus, X, Save, Check, Ban, ChevronRight, Eye, Trash2,
  Clock, TrendingUp, Activity, Building2, Gavel, UserCog,
  AlertTriangle, Info, Download
} from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../components/Toast'
import { useAuthStore } from '../store/authStore'
import { useClienteStore } from '../store/clienteStore'
import { useConsentimientoStore } from '../store/consentimientoStore'
import { useSolicitudArcoStore } from '../store/solicitudArcoStore'
import { useFirmaStore } from '../store/firmaStore'
import { useConfigStore } from '../store/configStore'

// ─── Utility Helpers ──────────────────────────────────────────────────────────
const ACCION_COLORS = {
  CREAR:          { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  ACTUALIZAR:     { bg: 'bg-blue-50 dark:bg-blue-500/10',      text: 'text-blue-700 dark:text-blue-400',      dot: 'bg-blue-500' },
  ELIMINAR:       { bg: 'bg-rose-50 dark:bg-rose-500/10',      text: 'text-rose-700 dark:text-rose-400',      dot: 'bg-rose-500' },
  LOGIN:          { bg: 'bg-violet-50 dark:bg-violet-500/10',  text: 'text-violet-700 dark:text-violet-400',  dot: 'bg-violet-500' },
  AVANZAR_ESTADO: { bg: 'bg-amber-50 dark:bg-amber-500/10',    text: 'text-amber-700 dark:text-amber-400',    dot: 'bg-amber-500' },
  APROBAR:        { bg: 'bg-teal-50 dark:bg-teal-500/10',      text: 'text-teal-700 dark:text-teal-400',      dot: 'bg-teal-500' },
  RECHAZAR:       { bg: 'bg-orange-50 dark:bg-orange-500/10',  text: 'text-orange-700 dark:text-orange-400',  dot: 'bg-orange-500' },
  GENERAR_FACTURA:{ bg: 'bg-indigo-50 dark:bg-indigo-500/10',  text: 'text-indigo-700 dark:text-indigo-400',  dot: 'bg-indigo-500' },
}
const ARCO_ESTADO = {
  PENDIENTE:   { label: 'Pendiente',   cls: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', icon: Clock },
  EN_PROCESO:  { label: 'En proceso',  cls: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300',     icon: RefreshCw },
  COMPLETADA:  { label: 'Completada',  cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300', icon: CheckCircle2 },
  RECHAZADA:   { label: 'Rechazada',   cls: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',     icon: Ban },
}
const ARCO_TIPOS = {
  ACCESO:       { color: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10', label: 'Acceso' },
  RECTIFICACION:{ color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',         label: 'Rectificación' },
  CANCELACION:  { color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10',         label: 'Cancelación' },
  OPOSICION:    { color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',      label: 'Oposición' },
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="relative overflow-hidden p-5 bg-white dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10 ${color}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MarcoLegal() {
  const toast = useToast()
  const { user } = useAuthStore()
  const { clientes, fetchClientes } = useClienteStore()
  const { consentimientos, fetchConsentimientos, guardarConsentimiento } = useConsentimientoStore()
  const { solicitudes, fetchSolicitudes, crearSolicitud, actualizarEstadoSolicitud } = useSolicitudArcoStore()
  const { firmas, fetchFirmas, guardarFirma } = useFirmaStore()
  const { config, patchConfig } = useConfigStore()

  const [activeTab, setActiveTab] = useState('auditoria')
  const [loading, setLoading] = useState(false)

  // Auditoría
  const [logs, setLogs] = useState([])
  const [filtroEntidad, setFiltroEntidad] = useState('')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const [limiteLogs, setLimiteLogs] = useState(50)
  const [usuariosSistema, setUsuariosSistema] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  // Consentimientos
  const [clienteSeleccionado, setClienteSeleccionado] = useState('')
  const [consentimientoTipo, setConsentimientoTipo] = useState('COMPARTIR_TERCEROS')
  const [consentimientoOtorgado, setConsentimientoOtorgado] = useState(true)
  const [consentimientoObs, setConsentimientoObs] = useState('')

  // ARCO
  const [arcoClienteId, setArcoClienteId] = useState('')
  const [arcoTipo, setArcoTipo] = useState('ACCESO')
  const [arcoDescripcion, setArcoDescripcion] = useState('')
  const [arcoResolviendoId, setArcoResolviendoId] = useState(null)
  const [arcoNuevoEstado, setArcoNuevoEstado] = useState('COMPLETADA')
  const [arcoRespuestaText, setArcoRespuestaText] = useState('')

  // Accesibilidad
  const [altoContraste, setAltoContraste] = useState(() => localStorage.getItem('accesibilidad-contraste') === 'true')
  const [tamanioTexto, setTamanioTexto] = useState(() => localStorage.getItem('accesibilidad-texto') || 'base')
  const [checklistWcag, setChecklistWcag] = useState(() => {
    const g = localStorage.getItem('checklist-wcag')
    return g ? JSON.parse(g) : { contrasteTexto: true, navegacionTeclado: false, lectoresPantalla: false, textosAlternativos: true, formulariosEtiquetados: false }
  })

  // Cumplimiento
  const [politicaTexto, setPoliticaTexto] = useState('')

  // Firma Digital
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [firmanteNombre, setFirmanteNombre] = useState('')
  const [firmaEntidad, setFirmaEntidad] = useState('CONSENTIMIENTO')
  const [firmaEntidadId, setFirmaEntidadId] = useState('')

  useEffect(() => { fetchClientes(); cargarUsuarios(); cargarPolitica() }, [])
  useEffect(() => {
    if (activeTab === 'auditoria') cargarLogs()
    if (activeTab === 'privacidad') fetchConsentimientos()
    if (activeTab === 'arco') fetchSolicitudes()
    if (activeTab === 'firma') fetchFirmas()
  }, [activeTab, filtroEntidad, filtroUsuario, limiteLogs])

  const cargarUsuarios = async () => {
    try { const r = await api.get('/usuarios'); setUsuariosSistema(r.data.data || []) } catch {}
  }
  const cargarPolitica = async () => {
    try {
      const r = await api.get('/configuracion')
      const pol = (r.data.data || []).find(c => c.clave === 'politica_privacidad')
      setPoliticaTexto(pol?.valor || defaultPolitica)
    } catch { setPoliticaTexto(defaultPolitica) }
  }
  const defaultPolitica = `POLÍTICA DE PRIVACIDAD — SIGEST TALLER MECÁNICO\nConforme a la Ley No. 172-13 sobre Protección de Datos de Carácter Personal (República Dominicana):\n\n1. RECOLECCIÓN DE DATOS\nSe recolecta nombre, cédula, correo, teléfono y dirección de los clientes con el único propósito de gestionar servicios de reparación de vehículos, presupuestos y facturación.\n\n2. TRAZABILIDAD\nTodo acceso y modificación de datos queda auditado en el registro interno del sistema.\n\n3. DERECHOS ARCO (Ley 133-21)\nLos titulares de datos pueden ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición solicitando el trámite en administración.\n\n4. SEGURIDAD\nLos datos sensibles de clientes se almacenan cifrados (AES-256) para impedir accesos no autorizados, en cumplimiento de la Ley 53-07.\n\n5. FIRMA DIGITAL\nLas firmas electrónicas tienen plena validez legal conforme a la Ley 126-02 sobre Comercio Electrónico, Documentos y Firmas Digitales.`

  const cargarLogs = async () => {
    setLoadingLogs(true)
    try {
      let q = `?limite=${limiteLogs}`
      if (filtroEntidad) q += `&entidad=${filtroEntidad}`
      if (filtroUsuario) q += `&usuarioId=${filtroUsuario}`
      const r = await api.get(`/log-actividad${q}`)
      setLogs(r.data.data || [])
    } catch { toast.show('Error al cargar auditoría.', 'error') }
    finally { setLoadingLogs(false) }
  }

  const handleGuardarConsentimiento = async (e) => {
    e.preventDefault()
    if (!clienteSeleccionado) { toast.show('Seleccione un cliente.', 'error'); return }
    try {
      setLoading(true)
      await guardarConsentimiento({ clienteId: clienteSeleccionado, tipo: consentimientoTipo, otorgado: consentimientoOtorgado, observacion: consentimientoObs })
      toast.show('Consentimiento guardado correctamente.', 'success')
      setConsentimientoObs(''); fetchConsentimientos()
    } catch { toast.show('Error al guardar consentimiento.', 'error') }
    finally { setLoading(false) }
  }

  const handleCrearArco = async (e) => {
    e.preventDefault()
    if (!arcoClienteId || !arcoDescripcion) { toast.show('Complete todos los campos requeridos.', 'error'); return }
    try {
      setLoading(true)
      await crearSolicitud({ clienteId: arcoClienteId, tipo: arcoTipo, descripcion: arcoDescripcion })
      toast.show('Solicitud ARCO registrada exitosamente.', 'success')
      setArcoDescripcion(''); fetchSolicitudes()
    } catch { toast.show('Error al registrar solicitud.', 'error') }
    finally { setLoading(false) }
  }

  const handleResolverArco = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await actualizarEstadoSolicitud(arcoResolviendoId, arcoNuevoEstado, arcoRespuestaText)
      toast.show('Solicitud actualizada correctamente.', 'success')
      setArcoResolviendoId(null); setArcoRespuestaText(''); fetchSolicitudes()
    } catch { toast.show('Error al actualizar solicitud.', 'error') }
    finally { setLoading(false) }
  }

  const aplicarContraste = (val) => {
    setAltoContraste(val); localStorage.setItem('accesibilidad-contraste', val)
    document.documentElement.classList.toggle('high-contrast', val)
  }
  const aplicarTamanio = (s) => {
    setTamanioTexto(s); localStorage.setItem('accesibilidad-texto', s)
    document.documentElement.classList.remove('text-lg-accessible', 'text-xl-accessible')
    if (s === 'lg') document.documentElement.classList.add('text-lg-accessible')
    if (s === 'xl') document.documentElement.classList.add('text-xl-accessible')
  }
  const toggleWcag = (k) => {
    const n = { ...checklistWcag, [k]: !checklistWcag[k] }
    setChecklistWcag(n); localStorage.setItem('checklist-wcag', JSON.stringify(n))
  }

  const wcagScore = Math.round((Object.values(checklistWcag).filter(Boolean).length / Object.keys(checklistWcag).length) * 100)

  // Canvas handlers
  const getXY = (e, rect) => {
    const src = e.touches ? e.touches[0] : e
    return { x: src.clientX - rect.left, y: src.clientY - rect.top }
  }
  const startDraw = (e) => {
    e.preventDefault()
    const c = canvasRef.current; if (!c) return
    const { x, y } = getXY(e, c.getBoundingClientRect())
    const ctx = c.getContext('2d'); ctx.beginPath(); ctx.moveTo(x, y)
    setIsDrawing(true); setHasDrawn(true)
  }
  const draw = (e) => {
    e.preventDefault()
    if (!isDrawing) return
    const c = canvasRef.current; if (!c) return
    const { x, y } = getXY(e, c.getBoundingClientRect())
    const ctx = c.getContext('2d')
    ctx.lineTo(x, y); ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke()
  }
  const endDraw = () => setIsDrawing(false)
  const limpiarCanvas = () => {
    const c = canvasRef.current; if (!c) return
    c.getContext('2d').clearRect(0, 0, c.width, c.height)
    setHasDrawn(false)
  }

  const handleGuardarFirma = async (e) => {
    e.preventDefault()
    if (!firmanteNombre || !firmaEntidadId || !hasDrawn) {
      toast.show('Nombre, ID de entidad y firma son requeridos.', 'error'); return
    }
    try {
      setLoading(true)
      await guardarFirma({ entidad: firmaEntidad, entidadId: firmaEntidadId, firmante: firmanteNombre, imagenBase64: canvasRef.current.toDataURL('image/png') })
      toast.show('Firma digital registrada y enlazada al expediente.', 'success')
      limpiarCanvas(); setFirmanteNombre(''); setFirmaEntidadId(''); fetchFirmas()
    } catch { toast.show('Error al guardar la firma.', 'error') }
    finally { setLoading(false) }
  }

  const guardarPolitica = async () => {
    try {
      setLoading(true)
      await patchConfig({ politica_privacidad: politicaTexto })
      toast.show('Política actualizada correctamente.', 'success')
    } catch { toast.show('Error al guardar la política.', 'error') }
    finally { setLoading(false) }
  }

  // ─── Stats para la cabecera ────────────────────────────────────────────────
  const pendientesArco = solicitudes.filter(s => s.estado === 'PENDIENTE').length
  const consentimientosOtorgados = consentimientos.filter(c => c.otorgado).length

  // ─── TABS CONFIG ──────────────────────────────────────────────────────────
  const TABS = [
    { id: 'auditoria',     label: 'Auditoría',          icon: FileSpreadsheet },
    { id: 'privacidad',    label: 'Privacidad',          icon: Lock },
    { id: 'arco',          label: 'Derechos ARCO',       icon: Scale },
    { id: 'accesibilidad', label: 'Accesibilidad',       icon: Accessibility },
    { id: 'roles',         label: 'Roles y Permisos',    icon: UserCog },
    { id: 'cumplimiento',  label: 'Cumplimiento Legal',  icon: Gavel },
    { id: 'firma',         label: 'Firma Digital',       icon: PenLine },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 px-6 py-10 md:px-10">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-56 h-56 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl shadow-xl shadow-teal-500/30">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-widest rounded-full border border-teal-500/30">
                    Solo Administrador
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  Marco Legal y Cumplimiento Ético
                </h1>
                <p className="text-sm text-slate-400 mt-0.5">
                  Leyes 172-13 · 133-21 · 53-07 · 126-02 — República Dominicana
                </p>
              </div>
            </div>

            {/* KPI chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur">
                <Activity className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Logs de hoy</p>
                  <p className="text-lg font-black text-white">{logs.filter(l => new Date(l.creadoEn).toDateString() === new Date().toDateString()).length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">ARCO Pendientes</p>
                  <p className="text-lg font-black text-white">{pendientesArco}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-2xl backdrop-blur">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">WCAG Score</p>
                  <p className="text-lg font-black text-white">{wcagScore}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ───────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <div className="flex overflow-x-auto scrollbar-hide">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'arco' && pendientesArco > 0 && (
                    <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center">
                      {pendientesArco}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 1. AUDITORÍA                                                    */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'auditoria' && (
          <div className="space-y-6 animate-fade-in">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Registro de Actividad del Sistema</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Conforme a la Ley 53-07 sobre Crímenes y Delitos de Alta Tecnología — trazabilidad completa de acciones.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <select value={filtroEntidad} onChange={e => setFiltroEntidad(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm">
                  <option value="">Todos los módulos</option>
                  {['ORDEN','CLIENTE','FACTURA','USUARIO','MECANICO'].map(e => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <select value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm">
                  <option value="">Todos los usuarios</option>
                  {usuariosSistema.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
                <select value={limiteLogs} onChange={e => setLimiteLogs(Number(e.target.value))}
                  className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm shadow-sm">
                  <option value={50}>Últimos 50</option>
                  <option value={100}>Últimos 100</option>
                  <option value={200}>Últimos 200</option>
                </select>
                <button onClick={cargarLogs}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-sm transition">
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              {/* Header de tabla */}
              <div className="grid grid-cols-[160px_1fr_130px_110px_1fr] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
                {['Fecha / Hora','Usuario','Módulo','Acción','Detalle del Evento'].map(h => (
                  <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{h}</span>
                ))}
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[520px] overflow-y-auto">
                {loadingLogs ? (
                  <div className="py-16 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-teal-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Cargando registros de auditoría…</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="py-16 text-center">
                    <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-400">Sin registros con los filtros actuales</p>
                  </div>
                ) : logs.map(log => {
                  const c = ACCION_COLORS[log.accion] || ACCION_COLORS.ACTUALIZAR
                  return (
                    <div key={log.id} className="grid grid-cols-[160px_1fr_130px_110px_1fr] px-4 py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors items-center group">
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(log.creadoEn).toLocaleString('es-DO', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.usuarioNombre}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">{log.usuarioRol}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px] font-semibold w-fit">
                        {log.entidad}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold w-fit ${c.bg} ${c.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                        {log.accion}
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-300 truncate pr-2" title={log.detalle}>{log.detalle}</p>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 text-xs text-slate-400 text-right">
                Mostrando {logs.length} de {limiteLogs} registros · Hora del servidor en UTC
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 2. PRIVACIDAD                                                   */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'privacidad' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Gestión de Consentimientos</h2>
              <p className="text-sm text-slate-500 mt-0.5">Ley 172-13 RD — los clientes deben autorizar el uso de sus datos para finalidades distintas al servicio contratado.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form */}
              <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Registrar Consentimiento</h3>
                </div>
                <form onSubmit={handleGuardarConsentimiento} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cliente *</label>
                    <select value={clienteSeleccionado} onChange={e => setClienteSeleccionado(e.target.value)} required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                      <option value="">Seleccione un cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo *</label>
                    <select value={consentimientoTipo} onChange={e => setConsentimientoTipo(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                      <option value="COMPARTIR_TERCEROS">Compartir con aseguradoras / terceros</option>
                      <option value="MARKETING">Marketing y comunicaciones</option>
                      <option value="GENERAL">Tratamiento general de datos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estado del Consentimiento</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setConsentimientoOtorgado(true)}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${consentimientoOtorgado ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                        <Check className="w-3.5 h-3.5 inline mr-1" /> OTORGADO
                      </button>
                      <button type="button" onClick={() => setConsentimientoOtorgado(false)}
                        className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${!consentimientoOtorgado ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                        <Ban className="w-3.5 h-3.5 inline mr-1" /> REVOCADO
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Observación</label>
                    <textarea value={consentimientoObs} onChange={e => setConsentimientoObs(e.target.value)} rows={3}
                      placeholder="Ej. Otorgado verbalmente en recepción el 17/07/2026..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Consentimiento
                  </button>
                </form>
              </div>

              {/* Table */}
              <div className="xl:col-span-2 bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Historial de Consentimientos</h3>
                  <span className="text-xs text-slate-400">{consentimientos.length} registros</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[480px] overflow-y-auto">
                  {consentimientos.length === 0 ? (
                    <div className="py-16 text-center">
                      <Lock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No hay consentimientos registrados</p>
                    </div>
                  ) : consentimientos.map(c => (
                    <div key={c.id} className="px-6 py-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{c.cliente?.nombre || '—'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {c.tipo === 'COMPARTIR_TERCEROS' ? 'Compartir con terceros / aseguradoras' : c.tipo === 'MARKETING' ? 'Marketing y comunicaciones' : 'Tratamiento general'}
                        </p>
                        {c.observacion && <p className="text-xs text-slate-500 italic mt-1 truncate">"{c.observacion}"</p>}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.otorgado ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'}`}>
                          {c.otorgado ? '✓ OTORGADO' : '✗ REVOCADO'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.actualizadoEn).toLocaleDateString('es-DO')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 3. ARCO                                                         */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'arco' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Derechos de los Titulares — ARCO</h2>
                <p className="text-sm text-slate-500 mt-0.5">Ley 133-21 RD — Acceso · Rectificación · Cancelación · Oposición</p>
              </div>
              {pendientesArco > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{pendientesArco} solicitud{pendientesArco !== 1 ? 'es' : ''} pendiente{pendientesArco !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Form ARCO */}
              <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-800 dark:text-white text-sm">Nueva Solicitud ARCO</h3>
                </div>
                <form onSubmit={handleCrearArco} className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cliente Titular *</label>
                    <select value={arcoClienteId} onChange={e => setArcoClienteId(e.target.value)} required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                      <option value="">Seleccione cliente...</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Derecho Solicitado *</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(ARCO_TIPOS).map(([k, v]) => (
                        <button key={k} type="button" onClick={() => setArcoTipo(k)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all text-left ${arcoTipo === k ? `border-teal-500 ${v.color}` : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descripción de la petición *</label>
                    <textarea value={arcoDescripcion} onChange={e => setArcoDescripcion(e.target.value)} rows={4} required
                      placeholder="Describa con detalle lo que solicita el cliente titular..."
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none" />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Registrar Solicitud
                  </button>
                </form>
              </div>

              {/* Lista ARCO */}
              <div className="xl:col-span-2 space-y-3">
                {solicitudes.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center shadow-sm">
                    <Scale className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No hay solicitudes ARCO registradas</p>
                  </div>
                ) : solicitudes.map(sol => {
                  const est = ARCO_ESTADO[sol.estado] || ARCO_ESTADO.PENDIENTE
                  const tipo = ARCO_TIPOS[sol.tipo] || {}
                  const EstIcon = est.icon
                  return (
                    <div key={sol.id} className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                      <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${tipo.color}`}>{sol.tipo}</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{sol.cliente?.nombre || '—'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${est.cls}`}>
                            <EstIcon className="w-3 h-3" /> {est.label}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(sol.creadoEn).toLocaleDateString('es-DO')}</span>
                        </div>
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-sm text-slate-600 dark:text-slate-300">{sol.descripcion}</p>
                        {sol.respuesta && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Respuesta Oficial</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300">{sol.respuesta}</p>
                          </div>
                        )}
                      </div>
                      {sol.estado !== 'COMPLETADA' && sol.estado !== 'RECHAZADA' && (
                        <div className="px-5 pb-4">
                          <button onClick={() => { setArcoResolviendoId(sol.id); setArcoRespuestaText(sol.respuesta || '') }}
                            className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 transition">
                            <ChevronRight className="w-3.5 h-3.5" /> Responder y Resolver
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Resolver */}
            {arcoResolviendoId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
                <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white">Responder Solicitud ARCO</h3>
                    <button onClick={() => setArcoResolviendoId(null)} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleResolverArco} className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nuevo Estado</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[['EN_PROCESO','En Proceso','blue'],['COMPLETADA','Aprobada','emerald'],['RECHAZADA','Rechazada','rose']].map(([val, lbl, col]) => (
                          <button key={val} type="button" onClick={() => setArcoNuevoEstado(val)}
                            className={`py-2 rounded-xl text-xs font-bold border-2 transition-all ${arcoNuevoEstado === val ? `bg-${col}-500 border-${col}-500 text-white` : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {lbl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Respuesta oficial al titular *</label>
                      <textarea value={arcoRespuestaText} onChange={e => setArcoRespuestaText(e.target.value)} rows={5} required
                        placeholder="Describa la acción tomada en detalle. Esta respuesta será parte del expediente legal..."
                        className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm resize-none" />
                    </div>
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={() => setArcoResolviendoId(null)}
                        className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                        Cancelar
                      </button>
                      <button type="submit" disabled={loading}
                        className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold rounded-xl text-sm shadow-md transition">
                        Guardar Resolución
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 4. ACCESIBILIDAD                                                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'accesibilidad' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Accesibilidad e Inclusión</h2>
              <p className="text-sm text-slate-500 mt-0.5">Pautas WCAG 2.1 — garantice que el sistema sea usable por personas mayores o con discapacidades visuales.</p>
            </div>

            {/* Score visual */}
            <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-teal-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-100">Puntuación WCAG actual</p>
                  <p className="text-6xl font-black mt-1">{wcagScore}<span className="text-3xl font-bold text-teal-200">%</span></p>
                  <p className="text-sm text-teal-200 mt-2">
                    {wcagScore === 100 ? '✓ Cumplimiento total' : wcagScore >= 60 ? '⚠ Cumplimiento parcial — revise pendientes' : '✗ Cumplimiento insuficiente'}
                  </p>
                </div>
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="12"
                      strokeDasharray={`${wcagScore * 2.51} 251`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-black">{wcagScore}%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ajustes rápidos */}
              <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Ajustes de Interfaz</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* Toggle contraste */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Modo Alto Contraste</p>
                      <p className="text-xs text-slate-400 mt-0.5">Fondo oscuro, texto blanco puro, bordes marcados.</p>
                    </div>
                    <button onClick={() => aplicarContraste(!altoContraste)}
                      className={`relative w-12 h-6 rounded-full transition-all duration-200 ${altoContraste ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${altoContraste ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-800" />

                  {/* Tamaño texto */}
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">Tamaño de Tipografía</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[['base','Normal (100%)','Aa'],['lg','Grande (115%)','Aa'],['xl','Muy Grande (130%)','Aa']].map(([id, label, preview]) => (
                        <button key={id} onClick={() => aplicarTamanio(id)}
                          className={`py-3 px-2 rounded-xl border-2 text-center transition-all ${tamanioTexto === id ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                          <p className={`font-bold text-teal-600 dark:text-teal-400 ${id === 'base' ? 'text-base' : id === 'lg' ? 'text-xl' : 'text-2xl'}`}>{preview}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist WCAG */}
              <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Verificación WCAG 2.1</h3>
                  <span className="text-xs text-slate-400">Marque antes de cada lanzamiento</span>
                </div>
                <div className="p-6 space-y-2">
                  {[
                    { k: 'contrasteTexto',       label: 'Contraste de texto mínimo 4.5:1 (criterio 1.4.3)' },
                    { k: 'navegacionTeclado',    label: 'Navegación por teclado y focus visible (2.1.1)' },
                    { k: 'lectoresPantalla',     label: 'Compatibilidad con lectores de pantalla (4.1.2)' },
                    { k: 'textosAlternativos',   label: 'Texto alternativo en imágenes (1.1.1)' },
                    { k: 'formulariosEtiquetados', label: 'Formularios con etiquetas accesibles (1.3.1)' },
                  ].map(({ k, label }) => (
                    <div key={k} onClick={() => toggleWcag(k)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${checklistWcag[k] ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/5' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${checklistWcag[k] ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
                        {checklistWcag[k] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm ${checklistWcag[k] ? 'text-emerald-800 dark:text-emerald-300 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 5. ROLES Y PERMISOS                                             */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'roles' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Matriz de Roles y Permisos</h2>
              <p className="text-sm text-slate-500 mt-0.5">Principio de mínimo privilegio — cada rol accede únicamente a lo necesario para su función.</p>
            </div>

            {/* Leyenda de roles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { rol: 'MECÁNICO', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', desc: 'Accede a órdenes asignadas' },
                { rol: 'RECEPCIONISTA', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400', desc: 'Crea clientes y órdenes' },
                { rol: 'CAJERO', color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400', desc: 'Gestiona facturación' },
                { rol: 'ADMINISTRADOR', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400', desc: 'Control total del sistema' },
              ].map(r => (
                <div key={r.rol} className={`p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 ${r.color}`}>
                  <p className="text-xs font-black uppercase tracking-wider">{r.rol}</p>
                  <p className="text-xs mt-1 opacity-70">{r.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Mecánico</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-blue-400">Recepcionista</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-indigo-400">Cajero</th>
                      <th className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-amber-400">Administrador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {[
                      { mod: 'Dashboard',          m: 'Ver',         r: 'Ver',     c: 'Ver',       a: 'Control Total' },
                      { mod: 'Clientes',           m: '—',           r: 'Crear / Editar', c: 'Ver', a: 'Control Total' },
                      { mod: 'Vehículos',          m: 'Ver',         r: 'Crear / Editar', c: 'Ver', a: 'Control Total' },
                      { mod: 'Órdenes de Servicio',m: 'Actualizar estado (reparar)', r: 'Crear / Editar', c: 'Ver', a: 'Control Total' },
                      { mod: 'Equipo Técnico',     m: '—',           r: '—',       c: '—',         a: 'Control Total' },
                      { mod: 'Facturación',        m: '—',           r: 'Ver',     c: 'Crear / Cobrar', a: 'Control Total' },
                      { mod: 'Configuración',      m: '—',           r: '—',       c: '—',         a: 'Control Total' },
                      { mod: 'Marco Legal / Auditoría', m: '—',      r: '—',       c: '—',         a: 'Control Total' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-bold text-sm text-slate-800 dark:text-slate-200">{row.mod}</td>
                        {[row.m, row.r, row.c, row.a].map((perm, j) => (
                          <td key={j} className="px-4 py-4 text-center">
                            {perm === '—' ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-500/10">
                                <X className="w-3.5 h-3.5 text-rose-400" />
                              </span>
                            ) : perm === 'Control Total' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] font-bold">
                                <ShieldCheck className="w-3 h-3" /> Total
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-[11px] font-semibold">
                                <Check className="w-3 h-3" /> {perm}
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
              <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Seguridad a nivel de backend:</strong> Los permisos son validados en el servidor mediante middleware de roles. El frontend solo oculta los elementos de UI — la restricción real es técnica, no visual.
              </p>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 6. CUMPLIMIENTO LEGAL                                           */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'cumplimiento' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Política de Privacidad Interna</h2>
                <p className="text-sm text-slate-500 mt-0.5">Ley 172-13 RD — documento normativo que rige el tratamiento de datos en el taller.</p>
              </div>
              <button onClick={guardarPolitica} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold rounded-xl shadow-md transition text-sm">
                <Save className="w-4 h-4" /> Guardar Política
              </button>
            </div>

            {/* Referencias legales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { ley: 'Ley 172-13', desc: 'Protección de Datos Personales' },
                { ley: 'Ley 133-21', desc: 'Derechos ARCO modernos' },
                { ley: 'Ley 53-07',  desc: 'Crímenes Tecnológicos' },
                { ley: 'Ley 126-02', desc: 'Firmas y Comercio Digital' },
              ].map(l => (
                <div key={l.ley} className="p-4 bg-teal-50 dark:bg-teal-500/5 border border-teal-100 dark:border-teal-500/20 rounded-2xl">
                  <p className="text-xs font-black text-teal-700 dark:text-teal-400">{l.ley}</p>
                  <p className="text-xs text-teal-600 dark:text-teal-500 mt-1">{l.desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Editor de Política</h3>
                <span className="text-xs text-slate-400">{politicaTexto.length} caracteres</span>
              </div>
              <div className="p-6">
                <textarea
                  value={politicaTexto}
                  onChange={e => setPoliticaTexto(e.target.value)}
                  rows={18}
                  className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm text-slate-700 dark:text-slate-200 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════ */}
        {/* 7. FIRMA DIGITAL                                                */}
        {/* ════════════════════════════════════════════════════════════════ */}
        {activeTab === 'firma' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Firma Digital Electrónica</h2>
              <p className="text-sm text-slate-500 mt-0.5">Ley 126-02 RD — las firmas electrónicas tienen plena validez legal en República Dominicana.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Panel de Captura */}
              <div className="xl:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">Captura de Firma</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Firme directamente en el lienzo con el cursor o el dedo.</p>
                  </div>
                  <form onSubmit={handleGuardarFirma} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tipo de Documento *</label>
                        <select value={firmaEntidad} onChange={e => setFirmaEntidad(e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                          <option value="CONSENTIMIENTO">Consentimiento</option>
                          <option value="ORDEN">Orden de Servicio</option>
                          <option value="FACTURA">Factura</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">ID / Código del Documento *</label>
                        <input type="text" value={firmaEntidadId} onChange={e => setFirmaEntidadId(e.target.value)} required
                          placeholder="UUID o código de referencia"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nombre del Firmante *</label>
                        <input type="text" value={firmanteNombre} onChange={e => setFirmanteNombre(e.target.value)} required
                          placeholder="Nombre completo"
                          className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm" />
                      </div>
                    </div>

                    {/* Canvas */}
                    <div className="relative">
                      <div className={`relative border-2 rounded-2xl overflow-hidden transition-all ${isDrawing ? 'border-teal-400 shadow-lg shadow-teal-500/10' : hasDrawn ? 'border-emerald-300 dark:border-emerald-500/40' : 'border-dashed border-slate-300 dark:border-slate-600'}`}>
                        <canvas
                          ref={canvasRef}
                          width={700} height={200}
                          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                          className="w-full bg-white cursor-crosshair touch-none block"
                          style={{ height: '200px' }}
                        />
                        {!hasDrawn && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <PenLine className="w-8 h-8 text-slate-200 mb-2" />
                            <p className="text-sm font-medium text-slate-300">Firme aquí</p>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={limpiarCanvas}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition backdrop-blur">
                        <Trash2 className="w-3 h-3" /> Borrar
                      </button>
                    </div>

                    {/* Estado */}
                    {hasDrawn && (
                      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">Firma capturada. Verifique los datos antes de registrar.</p>
                      </div>
                    )}

                    <button type="submit" disabled={loading || !hasDrawn}
                      className={`w-full py-3 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 ${hasDrawn ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white shadow-md shadow-teal-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                      <PenLine className="w-4 h-4" /> Registrar y Almacenar Firma Digital
                    </button>
                  </form>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    La firma se guarda en formato PNG encriptado y queda enlazada al documento en el registro de auditoría, con fecha, hora y usuario del sistema que autorizó la transacción.
                  </p>
                </div>
              </div>

              {/* Expediente de Firmas */}
              <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden h-fit">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white">Expediente de Firmas</h3>
                  <span className="text-xs text-slate-400">{firmas.length} registros</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[520px] overflow-y-auto">
                  {firmas.length === 0 ? (
                    <div className="py-12 text-center">
                      <PenLine className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">No hay firmas digitales en el expediente</p>
                    </div>
                  ) : firmas.map(f => (
                    <div key={f.id} className="px-5 py-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">{f.firmante}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{f.entidad} · {f.entidadId?.substring(0,12)}…</p>
                        </div>
                        <span className="text-[10px] text-slate-400">{new Date(f.creadoEn).toLocaleDateString('es-DO')}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-100 dark:border-slate-800 rounded-lg p-2">
                        <img src={f.imagenBase64} alt="Firma digital" className="h-10 w-full object-contain" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Validado por {f.usuario?.nombre}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
