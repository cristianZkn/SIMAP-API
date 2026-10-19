/**
 * RoleGuard.tsx — Guard de ruta que requiere un rol específico.
 * 
 * Si el usuario tiene sesión pero su rol no está en la lista de rolesPermitidos,
 * lo redirige a /403 (Acceso denegado).
 * 
 * IMPORTANTE: Este guard es solo protección visual de la UI.
 * El backend valida el rol en cada endpoint (RequireRole). Ambas capas son necesarias.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface RoleGuardProps {
  rolesPermitidos: string[]
}

export function RoleGuard({ rolesPermitidos }: RoleGuardProps) {
  const { rol } = useAuth()

  // Si el rol del usuario no está en la lista de permitidos → 403
  if (!rol || !rolesPermitidos.includes(rol)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
