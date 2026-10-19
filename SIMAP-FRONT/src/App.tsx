import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './app/Layout'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { RoleGuard } from './features/auth/RoleGuard'
import { LoginPage } from './features/auth/LoginPage'
import { VehiculosListPage } from './features/vehiculos/VehiculosListPage'
import { VehiculoFormPage } from './features/vehiculos/VehiculoFormPage'
import { BitacorasListPage } from './features/bitacoras/BitacorasListPage'
import { BitacoraFormPage } from './features/bitacoras/BitacoraFormPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ForbiddenPage } from './pages/ForbiddenPage'

/**
 * App: define el árbol de rutas de la aplicación.
 * 
 * Estructura de rutas:
 * - /login              → pública (sin sesión)
 * - /vehiculos          → protegida, solo Admin y Mecanico
 * - /bitacoras          → protegida, todos los roles
 * - /403                → página de acceso denegado
 * - /*                  → 404 Not Found
 */
function App() {
  return (
    <Routes>
      {/* Ruta pública: login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas: requieren sesión activa */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Redirige la raíz a vehículos */}
          <Route path="/" element={<Navigate to="/vehiculos" replace />} />

          {/* Vehículos: solo Admin y Mecánico */}
          <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico']} />}>
            <Route path="/vehiculos" element={<VehiculosListPage />} />
            <Route path="/vehiculos/nuevo" element={<VehiculoFormPage />} />
            <Route path="/vehiculos/:id/editar" element={<VehiculoFormPage />} />
          </Route>

          {/* Bitácoras: Admin, Mecánico y Conductor */}
          <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico', 'Conductor']} />}>
            <Route path="/bitacoras" element={<BitacorasListPage />} />
            <Route path="/bitacoras/nueva" element={<BitacoraFormPage />} />
            <Route path="/bitacoras/:id/editar" element={<BitacoraFormPage />} />
          </Route>
        </Route>
      </Route>

      {/* Páginas de error */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
