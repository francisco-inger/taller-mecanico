/**
 * ConfirmModal.jsx — Modal de confirmación que reemplaza window.confirm()
 *
 * Antes: window.confirm('¿Eliminar orden?') — bloquea UI, feo, no personalizable
 * Ahora: <ConfirmModal> — estilizado, no bloquea, con variantes de peligro
 *
 * Uso:
 *   const [confirmConfig, setConfirmConfig] = useState(null)
 *
 *   // Abrir:
 *   setConfirmConfig({
 *     title: '¿Eliminar orden?',
 *     message: 'Esta acción no se puede deshacer.',
 *     onConfirm: () => handleEliminar(id),
 *     danger: true
 *   })
 *
 *   // En JSX:
 *   <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />
 */

import { AlertTriangle, HelpCircle, X } from 'lucide-react'

export default function ConfirmModal({ config, onClose }) {
  if (!config) return null

  const { title, message, onConfirm, danger = false, confirmText = 'Confirmar', cancelText = 'Cancelar' } = config

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[popIn_0.2s_ease-out]">

        {/* Ícono */}
        <div className="flex justify-center mb-4">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${
            danger ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {danger
              ? <AlertTriangle size={28} className="text-red-500" />
              : <HelpCircle size={28} className="text-blue-500" />
            }
          </div>
        </div>

        {/* Contenido */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">{title}</h3>
        {message && (
          <p className="text-sm text-gray-500 text-center mb-5">{message}</p>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 font-bold rounded-xl shadow-md transition-all duration-200 hover:scale-105 ${
              danger
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
