/**
 * ProtectedRoute.tsx — Guard de ruta que requiere sesión activa.
 * 
 * Si el usuario no está autenticado, lo redirige al login guardando
 * la URL actual en el query param "retorno" para volver después de iniciar sesión.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Guardamos la ruta deseada para redirigir tras el login exitoso
    const retorno = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?retorno=${retorno}`} replace />
  }

  // Outlet renderiza la ruta hija si el usuario está autenticado
  return <Outlet />
}
