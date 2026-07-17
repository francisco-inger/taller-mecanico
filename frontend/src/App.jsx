import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import { ToastProvider } from './components/Toast'
// Páginas (se implementarán luego)
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ordenes from './pages/Ordenes'
import NuevaOrden from './pages/NuevaOrden'
import Clientes from './pages/Clientes'
import Usuarios from './pages/Usuarios'
import Mecanicos from './pages/Mecanicos'
import Facturacion from './pages/Facturacion'
import Configuracion from './pages/Configuracion'
import MarcoLegal from './pages/MarcoLegal'

// PrivateRoute sigue existiendo para las rutas que están detrás de autenticación.
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" />
}

// RoleRoute protege vistas basándose en los roles del usuario.
const RoleRoute = ({ children, allowedRoles }) => {
  const user = useAuthStore(state => state.user)
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" />
  if (!user || !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <ToastProvider>
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
          <Route
            path="ordenes/nueva"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'RECEPCIONISTA']}>
                <NuevaOrden />
              </RoleRoute>
            }
          />
          <Route
            path="clientes"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'RECEPCIONISTA', 'CAJERO']}>
                <Clientes />
              </RoleRoute>
            }
          />
          <Route
            path="usuarios"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Usuarios />
              </RoleRoute>
            }
          />
          <Route
            path="mecanicos"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Mecanicos />
              </RoleRoute>
            }
          />
          <Route
            path="facturacion"
            element={
              <RoleRoute allowedRoles={['ADMIN', 'CAJERO', 'RECEPCIONISTA']}>
                <Facturacion />
              </RoleRoute>
            }
          />
          <Route
            path="configuracion"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Configuracion />
              </RoleRoute>
            }
          />
          <Route
            path="marco-legal"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <MarcoLegal />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
    </ToastProvider>
  )
}

export default App
