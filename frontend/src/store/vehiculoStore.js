import { create } from 'zustand'
import api from '../api/axios'

export const useVehiculoStore = create((set) => ({
  vehiculos: [],
  loading: false,
  error: null,

  fetchVehiculosPorCliente: async (clienteId) => {
    if (!clienteId) {
      set({ vehiculos: [] });
      return;
    }
    set({ loading: true })
    try {
      const response = await api.get(`/vehiculos/cliente/${clienteId}`)
      set({ vehiculos: response.data.data || [], loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  }
}))
