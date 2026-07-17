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
    
    // Load local storage fallback first (offline/optimistic support)
    let localConfig = {}
    try {
      const saved = localStorage.getItem('sigest-local-config')
      if (saved) localConfig = JSON.parse(saved)
    } catch (_) {}

    const mergedInitial = { ...DEFAULT_CONFIG, ...localConfig }
    set({ config: mergedInitial })
    document.documentElement.setAttribute('data-theme', mergedInitial.tema)
    document.documentElement.setAttribute('data-accent', mergedInitial.color_acento)

    try {
      const response = await api.get('/configuracion')
      const fetchedConfig = response.data.data
      const finalConfig = { ...DEFAULT_CONFIG, ...localConfig, ...fetchedConfig }
      set({ 
        config: finalConfig, 
        loading: false 
      })
      
      document.documentElement.setAttribute('data-theme', finalConfig.tema)
      document.documentElement.setAttribute('data-accent', finalConfig.color_acento)
      
      try {
        localStorage.setItem('sigest-local-config', JSON.stringify(finalConfig))
      } catch (_) {}
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },

  updateConfig: async (clavesArray) => {
    // 1. Optimistic local update
    const currentConfig = get().config
    const newConfig = { ...currentConfig }
    clavesArray.forEach(c => {
      newConfig[c.clave] = c.valor
    })
    
    set({ config: newConfig })
    
    // Apply visual properties immediately to DOM
    const temaObj = clavesArray.find(c => c.clave === 'tema')
    if (temaObj) {
      document.documentElement.setAttribute('data-theme', temaObj.valor)
    }
    const acentoObj = clavesArray.find(c => c.clave === 'color_acento')
    if (acentoObj) {
      document.documentElement.setAttribute('data-accent', acentoObj.valor)
    }
    
    try {
      localStorage.setItem('sigest-local-config', JSON.stringify(newConfig))
    } catch (_) {}

    // 2. Perform backend sync
    set({ loading: true, error: null })
    try {
      const response = await api.patch('/configuracion', { claves: clavesArray })
      const updatedConfig = response.data.data
      const finalConfig = { ...DEFAULT_CONFIG, ...updatedConfig }
      set({ 
        config: finalConfig, 
        loading: false 
      })
      return finalConfig
    } catch (error) {
      set({ error: error.message, loading: false })
      console.warn('Backend sync failed, using local configuration:', error.message)
      return newConfig
    }
  }
}))
