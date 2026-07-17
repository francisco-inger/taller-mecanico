import { create } from 'zustand'
import api from '../api/axios'

export const useConsentimientoStore = create((set, get) => ({
  consentimientos: [],
  loading: false,
  error: null,

  fetchConsentimientos: async (clienteId = null) => {
    set({ loading: true })
    try {
      const url = clienteId ? `/consentimientos?clienteId=${clienteId}` : '/consentimientos'
      const response = await api.get(url)
      set({ consentimientos: response.data.data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  guardarConsentimiento: async (consentimientoData) => {
    set({ loading: true })
    try {
      const response = await api.post('/consentimientos', consentimientoData)
      const data = response.data.data
      
      // Actualizar la lista localmente
      set(state => {
        const existIdx = state.consentimientos.findIndex(c => c.id === data.id)
        let nuevas;
        if (existIdx > -1) {
          nuevas = state.consentimientos.map(c => c.id === data.id ? data : c)
        } else {
          nuevas = [data, ...state.consentimientos]
        }
        return { consentimientos: nuevas, loading: false }
      })
      return data;
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
