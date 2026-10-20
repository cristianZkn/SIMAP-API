import { Routes, Route } from 'react-router-dom'
import { Layout } from './app/Layout'
import { ProtectedRoute } from './features/auth/ProtectedRoute'
import { RoleGuard } from './features/auth/RoleGuard'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { VehiculosListPage } from './features/vehiculos/VehiculosListPage'
import { VehiculoFormPage } from './features/vehiculos/VehiculoFormPage'
import { BitacorasListPage } from './features/bitacoras/BitacorasListPage'
import { BitacoraFormPage } from './features/bitacoras/BitacoraFormPage'
import { ConfiguracionCatalogosPage } from './features/configuracion/ConfiguracionCatalogosPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ForbiddenPage } from './pages/ForbiddenPage'

/**
 * App: define el árbol de rutas de la aplicación.
 * 
 * Estructura de rutas:
 * - /login              → pública (sin sesión)
 * - /registro           → pública (sin sesión)
 * - /                   → protegida, Dashboard principal con métricas y gráficos
 * - /vehiculos          → protegida, solo Admin y Mecánico
 * - /bitacoras          → protegida, todos los roles
 * - /configuracion      → protegida, solo Admin (estados y prioridades)
 * - /403                → página de acceso denegado
 * - /*                  → 404 Not Found
 */
function App() {
  return (
    <Routes>
      {/* Rutas públicas: login y registro */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Rutas protegidas: requieren sesión activa */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* Panel principal accesible para todos los roles autenticados */}
          <Route path="/" element={<DashboardPage />} />

          {/* Vehículos: Admin y Mecánico visualizan; solo Admin crea y edita */}
          <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico']} />}>
            <Route path="/vehiculos" element={<VehiculosListPage />} />
          </Route>
          <Route element={<RoleGuard rolesPermitidos={['Admin']} />}>
            <Route path="/vehiculos/nuevo" element={<VehiculoFormPage />} />
            <Route path="/vehiculos/:id/editar" element={<VehiculoFormPage />} />
          </Route>

          {/* Bitácoras: Admin, Mecánico y Conductor visualizan el listado */}
          <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico', 'Conductor']} />}>
            <Route path="/bitacoras" element={<BitacorasListPage />} />
          </Route>
          {/* Reportar fallas: Admin y Conductor */}
          <Route element={<RoleGuard rolesPermitidos={['Admin', 'Conductor']} />}>
            <Route path="/bitacoras/nueva" element={<BitacoraFormPage />} />
          </Route>
          {/* Edición de bitácoras: Admin (completo) y Mecánico (solo estado) */}
          <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico']} />}>
            <Route path="/bitacoras/:id/editar" element={<BitacoraFormPage />} />
          </Route>

          {/* Configuración de Estados y Prioridades: Solo Admin */}
          <Route element={<RoleGuard rolesPermitidos={['Admin']} />}>
            <Route path="/configuracion" element={<ConfiguracionCatalogosPage />} />
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
