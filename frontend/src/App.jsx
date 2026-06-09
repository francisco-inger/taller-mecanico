import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
// Páginas (se implementarán luego)
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ordenes from './pages/Ordenes'
import NuevaOrden from './pages/NuevaOrden'
import Clientes from './pages/Clientes'
import Usuarios from './pages/Usuarios'
import Mecanicos from './pages/Mecanicos'
import Facturacion from './pages/Facturacion'

// PrivateRoute sigue existiendo para las rutas que están detrás de autenticación.
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/*
          Requisito: al abrir la página principal siempre ir a login.
          Esto fuerza a que la ruta "\/" redirija SIEMPRE.
        */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/*
          Rutas protegidas. IMPORTANTE: ya no se montan bajo "\/",
          por lo que quedan accesibles por sus rutas absolutas.
        */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="ordenes" element={<Ordenes />} />
          <Route path="ordenes/nueva" element={<NuevaOrden />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="mecanicos" element={<Mecanicos />} />
          <Route path="facturacion" element={<Facturacion />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
