import { create } from 'zustand'
import api from '../api/axios'

export const useOrdenStore = create((set) => ({
  ordenes: [],
  loading: false,
  error: null,

  fetchOrdenes: async (filtros = {}) => {
    set({ loading: true })
    try {
      const response = await api.get('/ordenes', { params: filtros })
      set({ ordenes: response.data.data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  crearOrden: async (ordenData) => {
    set({ loading: true })
    try {
      const response = await api.post('/ordenes', ordenData)
      const nuevaOrden = response.data.data
      set((state) => ({
        ordenes: [nuevaOrden, ...state.ordenes],
        loading: false
      }))
      return nuevaOrden
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  avanzarEstado: async (id) => {
    set({ loading: true })
    try {
      const response = await api.patch(`/ordenes/${id}/avanzar`)
      const ordenActualizada = response.data.data
      set((state) => ({
        ordenes: state.ordenes.map((o) => (o.id === id ? ordenActualizada : o)),
        loading: false
      }))
      return ordenActualizada
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  eliminarOrden: async (id) => {
    try {
      await api.delete(`/ordenes/${id}`)
      set((state) => ({
        ordenes: state.ordenes.filter((o) => o.id !== id)
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  }
}))
