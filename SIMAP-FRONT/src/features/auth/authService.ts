/**
 * authService.ts — Servicio de autenticación.
 * Encapsula las llamadas a la API de auth para que los componentes
 * no llamen a httpClient directamente.
 */
import { httpClient } from '../../shared/api/httpClient'
import type { LoginRequest, LoginResponse, RegistroRequest, UsuarioDto } from '../../shared/types'

/** Envía las credenciales al backend y retorna token + datos del usuario. */
export async function login(datos: LoginRequest): Promise<LoginResponse> {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', datos)
  return data
}

/**
 * Registra un nuevo usuario. La contraseña viaja en el body JSON (no en la URL).
 * Retorna el UsuarioDto público (sin passwordHash).
 */
export async function registrar(datos: RegistroRequest): Promise<UsuarioDto> {
  const { data } = await httpClient.post<UsuarioDto>('/auth/registro', datos)
  return data
}
