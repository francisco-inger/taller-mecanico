/**
 * Toast.jsx — Sistema de notificaciones que reemplaza window.alert()
 *
 * Antes: alert('Orden eliminada exitosamente') — bloquea UI, feo
 * Ahora: Toast.success('Orden eliminada exitosamente') — no bloquea, estilizado
 *
 * Uso:
 *   import { useToast } from './Toast'
 *   const toast = useToast()
 *   toast.success('Guardado') | toast.error('Algo salió mal') | toast.info('Cargando...')
 */

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const toast = {
    success: (msg) => addToast('success', msg),
    error:   (msg) => addToast('error', msg, 6000),
    info:    (msg) => addToast('info', msg),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Contenedor de toasts */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onClose }) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-emerald-50 border-emerald-300',
      icon_color: 'text-emerald-600',
      text: 'text-emerald-800',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50 border-red-300',
      icon_color: 'text-red-600',
      text: 'text-red-800',
    },
    info: {
      icon: AlertCircle,
      bg: 'bg-blue-50 border-blue-300',
      icon_color: 'text-blue-600',
      text: 'text-blue-800',
    },
  }
  const { icon: Icon, bg, icon_color, text } = config[toast.type] || config.info

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg
        animate-[slideIn_0.3s_ease-out] ${bg}`}
    >
      <Icon size={20} className={`${icon_color} flex-shrink-0 mt-0.5`} />
      <p className={`flex-1 text-sm font-medium ${text}`}>{toast.message}</p>
      <button
        onClick={onClose}
        className={`${icon_color} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}

/** Hook para usar el sistema de toasts desde cualquier componente */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}
