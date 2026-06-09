import { create } from 'zustand'
import api from '../api/axios'

export const useFacturaStore = create((set) => ({
  facturas: [],
  loading: false,
  error: null,

  fetchFacturas: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/facturas')
      set({ facturas: response.data.data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  generarFactura: async (ordenId) => {
    set({ loading: true })
    try {
      const response = await api.post('/facturas', { ordenId })
      set(state => ({
        facturas: [response.data.data.factura, ...state.facturas],
        loading: false
      }))
      return response.data.data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateFactura: async (id, datos) => {
    set({ loading: true })
    try {
      const response = await api.patch(`/facturas/${id}`, datos)
      set(state => ({
        facturas: state.facturas.map(f => f.id === id ? { ...f, ...response.data.data } : f),
        loading: false
      }))
      return response.data.data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  deleteFactura: async (id) => {
    set({ loading: true })
    try {
      await api.delete(`/facturas/${id}`)
      set(state => ({
        facturas: state.facturas.filter(f => f.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
