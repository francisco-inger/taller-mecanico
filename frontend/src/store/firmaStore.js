import { create } from 'zustand'
import api from '../api/axios'

export const useFirmaStore = create((set, get) => ({
  firmas: [],
  loading: false,
  error: null,

  fetchFirmas: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/firmas')
      set({ firmas: response.data.data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  fetchFirmasEntidad: async (entidad, entidadId) => {
    set({ loading: true })
    try {
      const response = await api.get(`/firmas/${entidad}/${entidadId}`)
      set({ firmas: response.data.data || [], loading: false })
      return response.data.data || []
    } catch (error) {
      set({ error: error.message, loading: false })
      return []
    }
  },

  guardarFirma: async (firmaData) => {
    set({ loading: true })
    try {
      const response = await api.post('/firmas', firmaData)
      const data = response.data.data
      set(state => ({
        firmas: [data, ...state.firmas],
        loading: false
      }))
      return data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
