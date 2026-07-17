import { create } from 'zustand'
import api from '../api/axios'

export const useSolicitudArcoStore = create((set, get) => ({
  solicitudes: [],
  loading: false,
  error: null,

  fetchSolicitudes: async (clienteId = null) => {
    set({ loading: true })
    try {
      const url = clienteId ? `/solicitudes-arco?clienteId=${clienteId}` : '/solicitudes-arco'
      const response = await api.get(url)
      set({ solicitudes: response.data.data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  crearSolicitud: async (solicitudData) => {
    set({ loading: true })
    try {
      const response = await api.post('/solicitudes-arco', solicitudData)
      const data = response.data.data
      set(state => ({
        solicitudes: [data, ...state.solicitudes],
        loading: false
      }))
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  actualizarEstadoSolicitud: async (id, estado, respuesta) => {
    set({ loading: true })
    try {
      const response = await api.patch(`/solicitudes-arco/${id}/estado`, { estado, respuesta })
      const data = response.data.data
      set(state => ({
        solicitudes: state.solicitudes.map(s => s.id === id ? data : s),
        loading: false
      }))
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
