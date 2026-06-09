import { create } from 'zustand'
import api from '../api/axios'

export const useUsuarioStore = create((set, get) => ({
  usuarios: [],
  loading: false,
  error: null,

  fetchUsuarios: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/usuarios')
      set({ usuarios: response.data.data, loading: false })
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false })
    }
  },

  addUsuario: async (userData) => {
    set({ loading: true, error: null })
    try {
      const response = await api.post('/usuarios', userData)
      const newUsuario = response.data.data
      set(state => ({
        usuarios: [...state.usuarios, newUsuario],
        loading: false
      }))
      return newUsuario
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al crear usuario'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  updateUsuario: async (id, userData) => {
    set({ loading: true, error: null })
    try {
      const response = await api.patch(`/usuarios/${id}`, userData)
      const updatedUsuario = response.data.data
      set(state => ({
        usuarios: state.usuarios.map(u => u.id === id ? updatedUsuario : u),
        loading: false
      }))
      return updatedUsuario
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al actualizar usuario'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  }
}))
