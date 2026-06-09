import { create } from 'zustand'
import api from '../api/axios'

export const useClienteStore = create((set, get) => ({
  clientes: [],
  loading: false,
  error: null,

  fetchClientes: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/clientes')
      set({ clientes: response.data.data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  addCliente: async (clienteData) => {
    set({ loading: true })
    try {
      const response = await api.post('/clientes', clienteData)
      const newCliente = response.data.data
      set(state => ({ 
        clientes: [newCliente, ...state.clientes],
        loading: false 
      }))
      return newCliente
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  updateCliente: async (id, clienteData) => {
    set({ loading: true })
    try {
      const response = await api.patch(`/clientes/${id}`, clienteData)
      const updatedCliente = response.data.data
      set(state => ({
        clientes: state.clientes.map(c => (c.id === id ? updatedCliente : c)),
        loading: false
      }))
      return updatedCliente
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
