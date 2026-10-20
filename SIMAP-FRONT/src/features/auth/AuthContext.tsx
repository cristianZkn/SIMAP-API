/**
 * AuthContext.tsx — Estado global de sesión del usuario.
 * 
 * Usa el patrón Context + Provider de React para exponer en toda la app:
 * - El usuario autenticado y su rol.
 * - El token JWT (también guardado en sessionStorage para sobrevivir recargas).
 * - Funciones de login y logout.
 * 
 * Estrategia de almacenamiento del token: sessionStorage.
 * - Ventaja sobre localStorage: el token se borra al cerrar la pestaña.
 * - Riesgo: XSS puede leerlo. Mitigación: CSP estricta, sin dangerouslySetInnerHTML.
 * - Se descartó cookie HttpOnly porque el backend no soporta refresh tokens.
 * - Documentado en docs/INFORME_TECNICO.md sección "Autenticación".
 */
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { UsuarioDto } from '../../shared/types'

interface AuthState {
  token: string | null
  usuario: UsuarioDto | null
}

interface AuthContextValue extends AuthState {
  login: (token: string, usuario: UsuarioDto) => void
  logout: () => void
  isAuthenticated: boolean
  rol: string | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Valida si un JWT ha expirado leyendo su claim exp (en segundos). */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    // atob decodifica la sección payload en base64 del JWT
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return false
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

/** Carga el estado inicial desde sessionStorage para sobrevivir recargas de página. */
function cargarEstadoInicial(): AuthState {
  try {
    const token = sessionStorage.getItem('simap_token')
    const usuarioJson = sessionStorage.getItem('simap_usuario')
    if (token && usuarioJson) {
      if (isTokenExpired(token)) {
        sessionStorage.removeItem('simap_token')
        sessionStorage.removeItem('simap_usuario')
        return { token: null, usuario: null }
      }
      return { token, usuario: JSON.parse(usuarioJson) as UsuarioDto }
    }
  } catch {
    // Si el JSON o token está corrupto, limpiamos
    sessionStorage.removeItem('simap_token')
    sessionStorage.removeItem('simap_usuario')
  }
  return { token: null, usuario: null }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(cargarEstadoInicial)

  /** Guarda el token y los datos del usuario tras un login exitoso. */
  const login = useCallback((token: string, usuario: UsuarioDto) => {
    // El token NUNCA va en la URL ni en console.log (OWASP API2)
    sessionStorage.setItem('simap_token', token)
    sessionStorage.setItem('simap_usuario', JSON.stringify(usuario))
    setAuthState({ token, usuario })
  }, [])

  /** Limpia toda la sesión — se llama al hacer logout o cuando el backend devuelve 401. */
  const logout = useCallback(() => {
    sessionStorage.removeItem('simap_token')
    sessionStorage.removeItem('simap_usuario')
    setAuthState({ token: null, usuario: null })
  }, [])

  const value: AuthContextValue = {
    ...authState,
    login,
    logout,
    isAuthenticated: authState.token !== null,
    rol: authState.usuario?.rol ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook tipado para consumir el contexto de autenticación. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
