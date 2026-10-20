/**
 * httpClient.ts — Cliente HTTP centralizado para toda la aplicación.
 * 
 * Responsabilidades:
 * 1. Adjunta automáticamente el token JWT en cada petición protegida.
 * 2. Normaliza todos los errores a un tipo común (ApiError).
 * 3. Ante un 401 (token expirado/inválido), limpia la sesión y redirige al login.
 * 4. Ante un 403, redirige a la página de acceso denegado.
 * 5. La URL base se lee exclusivamente desde VITE_API_URL (nunca hardcodeada).
 */
import axios, { type AxiosError } from 'axios'

// La URL base viene del archivo .env — nunca se hardcodea en el código (OWASP Secret en bundle)
const BASE_URL = import.meta.env.VITE_API_URL as string

if (!BASE_URL) {
  throw new Error('La variable de entorno VITE_API_URL no está definida. Crea un archivo .env copiando .env.example')
}

// Tipo normalizado de error que todos los servicios reciben por igual
export interface ApiError {
  status: number
  message: string
  fieldErrors?: Record<string, string> // Para errores de validación por campo (futuro)
}

// Instancia de Axios preconfigurada
export const httpClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Interceptor de REQUEST: adjunta el token JWT de forma automática.
 * El token se guarda en sessionStorage para sobrevivir recargas de pestaña,
 * con el riesgo de XSS documentado en el informe técnico.
 * 
 * El token NUNCA viaja en la URL ni se guarda en localStorage para reducir
 * la superficie de ataque. (OWASP API2 — Broken Authentication)
 */
httpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('simap_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Interceptor de RESPONSE: manejo centralizado de errores HTTP.
 * Convierte cualquier error de Axios en un ApiError normalizado.
 */
httpClient.interceptors.response.use(
  // Respuesta exitosa: la devolvemos tal cual
  (response) => response,

  // Error HTTP: lo normalizamos
  (error: AxiosError) => {
    const status = error.response?.status ?? 0
    const esPeticionLogin = error.config?.url?.includes('/auth/login')

    // 401 — Sin sesión o token expirado en una ruta protegida
    if (status === 401) {
      sessionStorage.removeItem('simap_token')
      sessionStorage.removeItem('simap_usuario')

      // Solo redirigir si el 401 NO provino del propio formulario de login
      if (!esPeticionLogin && !window.location.pathname.startsWith('/login')) {
        const rutaActual = window.location.pathname + window.location.search
        window.location.href = `/login?retorno=${encodeURIComponent(rutaActual)}`
      }
    }

    // 403 — Acceso denegado por rol insuficiente
    if (status === 403) {
      window.location.href = '/403'
    }

    // Construimos el error normalizado que recibirán los hooks y componentes
    const apiError: ApiError = {
      status,
      message: obtenerMensajeError(error),
    }

    return Promise.reject(apiError)
  },
)

/** Extrae un mensaje legible del error de Axios, sea cual sea su formato. */
function obtenerMensajeError(error: AxiosError): string {
  const data = error.response?.data
  const status = error.response?.status
  const esPeticionLogin = error.config?.url?.includes('/auth/login')

  // Error 401 específico para formulario de login
  if (status === 401 && esPeticionLogin) {
    return 'Credenciales incorrectas. Verifica tu correo y contraseña.'
  }

  // El backend puede devolver un string plano (400 de validación) o un objeto JSON
  if (typeof data === 'string' && data.length > 0) return data
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.title === 'string') return obj.title
  }

  // Mensajes genéricos por código de estado
  switch (status) {
    case 400: return 'Los datos enviados no son válidos.'
    case 401: return 'Tu sesión ha expirado o el token es inválido. Por favor, inicia sesión nuevamente.'
    case 403: return 'No tienes permiso para realizar esta acción (Rol insuficiente).'
    case 404: return 'El recurso solicitado no fue encontrado.'
    case 429: return 'Demasiadas peticiones. Por favor, espera un momento e intenta de nuevo.'
    default:  return 'Ocurrió un error inesperado al conectar con el servidor. Intenta de nuevo más tarde.'
  }
}
