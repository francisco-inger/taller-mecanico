import { create } from 'zustand'
import api from '../api/axios'

const DEFAULT_CONFIG = {
  nombre_taller: 'Taller Mecánico',
  rnc: '',
  direccion: '',
  telefono: '',
  correo: '',
  itbis_porcentaje: '18',
  moneda: 'RD$',
  tema: 'claro',
  color_acento: 'azul-verde',
}

export const useConfigStore = create((set, get) => ({
  config: DEFAULT_CONFIG,
  loading: false,
  error: null,

  fetchConfig: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/configuracion')
      const fetchedConfig = response.data.data
      set({ 
        config: { ...DEFAULT_CONFIG, ...fetchedConfig }, 
        loading: false 
      })
      // Apply theme and accent color on load
      const tema = fetchedConfig.tema || 'claro'
      const acento = fetchedConfig.color_acento || 'azul-verde'
      document.documentElement.setAttribute('data-theme', tema)
      document.documentElement.setAttribute('data-accent', acento)
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  updateConfig: async (clavesArray) => {
    set({ loading: true, error: null })
    try {
      // payload format: { claves: [ { clave, valor }, ... ] }
      const response = await api.patch('/configuracion', { claves: clavesArray })
      const updatedConfig = response.data.data
      set({ 
        config: { ...DEFAULT_CONFIG, ...updatedConfig }, 
        loading: false 
      })
      
      // Look for theme or accent color changes and apply immediately
      const temaObj = clavesArray.find(c => c.clave === 'tema')
      if (temaObj) {
        document.documentElement.setAttribute('data-theme', temaObj.valor)
      }
      const acentoObj = clavesArray.find(c => c.clave === 'color_acento')
      if (acentoObj) {
        document.documentElement.setAttribute('data-accent', acentoObj.valor)
      }
      
      return response.data.data
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
