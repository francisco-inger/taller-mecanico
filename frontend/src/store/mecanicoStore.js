import { create } from 'zustand'
import api from '../api/axios'

export const useMecanicoStore = create((set) => ({
  mecanicos: [],
  estadisticas: [],
  loading: false,
  error: null,

  fetchMecanicos: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/mecanicos')
      set({ mecanicos: response.data.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  fetchEstadisticas: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/mecanicos/estadisticas')
      set({ estadisticas: response.data.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addMecanico: async (data) => {
    set({ loading: true })
    try {
      const response = await api.post('/mecanicos', data)
      set(state => ({
        mecanicos: [...state.mecanicos, response.data.data],
        loading: false
      }))
      return response.data.data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateMecanico: async (id, data) => {
    set({ loading: true })
    try {
      const response = await api.patch(`/mecanicos/${id}`, data)
      set(state => ({
        mecanicos: state.mecanicos.map(m => m.id === id ? response.data.data : m),
        loading: false
      }))
      return response.data.data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
