/**
 * Guards.test.tsx — Pruebas de ProtectedRoute y RoleGuard.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { renderWithProviders } from '../../test/test-utils'

function generarTokenValido(): string {
  const payloadB64 = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 7200 }))
  return `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.fakesig`
}

describe('Rutas Protegidas y Guards de Autorización', () => {
  it('ProtectedRoute redirige a /login si no hay token de sesión en sessionStorage', () => {
    // sessionStorage está vacío por defecto
    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/privado" element={<div>Contenido Privado</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/privado'] }
    )

    expect(screen.getByText('Página de Login')).toBeInTheDocument()
    expect(screen.queryByText('Contenido Privado')).not.toBeInTheDocument()
  })

  it('ProtectedRoute permite renderizar el contenido si existe sesión activa', () => {
    // Simulamos sesión válida con JWT no expirado
    sessionStorage.setItem('simap_token', generarTokenValido())
    sessionStorage.setItem(
      'simap_usuario',
      JSON.stringify({ id: 1, nombre: 'Mecánico 1', email: 'mecanico@simap.cl', rol: 'Mecanico', activo: true })
    )

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<div>Página de Login</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/privado" element={<div>Contenido Privado</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/privado'] }
    )

    expect(screen.getByText('Contenido Privado')).toBeInTheDocument()
  })

  it('RoleGuard permite acceso a usuarios con rol permitido', () => {
    sessionStorage.setItem('simap_token', generarTokenValido())
    sessionStorage.setItem(
      'simap_usuario',
      JSON.stringify({ id: 1, nombre: 'Admin', email: 'admin@simap.cl', rol: 'Admin', activo: true })
    )

    renderWithProviders(
      <Routes>
        <Route path="/403" element={<div>Acceso Denegado 403</div>} />
        <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico']} />}>
          <Route path="/vehiculos" element={<div>Gestión de Vehículos</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/vehiculos'] }
    )

    expect(screen.getByText('Gestión de Vehículos')).toBeInTheDocument()
    expect(screen.queryByText('Acceso Denegado 403')).not.toBeInTheDocument()
  })

  it('RoleGuard redirige a /403 si el rol del usuario no tiene permisos', () => {
    sessionStorage.setItem('simap_token', generarTokenValido())
    sessionStorage.setItem(
      'simap_usuario',
      JSON.stringify({ id: 4, nombre: 'Conductor', email: 'chofer@simap.cl', rol: 'Conductor', activo: true })
    )

    renderWithProviders(
      <Routes>
        <Route path="/403" element={<div>Acceso Denegado 403</div>} />
        <Route element={<RoleGuard rolesPermitidos={['Admin', 'Mecanico']} />}>
          <Route path="/vehiculos" element={<div>Gestión de Vehículos</div>} />
        </Route>
      </Routes>,
      { initialEntries: ['/vehiculos'] }
    )

    expect(screen.getByText('Acceso Denegado 403')).toBeInTheDocument()
    expect(screen.queryByText('Gestión de Vehículos')).not.toBeInTheDocument()
  })
})
