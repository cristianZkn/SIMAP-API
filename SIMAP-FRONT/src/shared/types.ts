/**
 * types.ts — Tipos y DTOs que espeja exactamente el contrato del backend.
 * Los nombres de campos son idénticos a los del servidor (camelCase de .NET).
 */

// --- Auth ---
export interface LoginRequest {
  email: string
  password: string
}

export interface RegistroRequest {
  nombre: string
  email: string
  password: string
  rolId: number
}

export interface UsuarioDto {
  id: number
  nombre: string
  email: string
  rolId: number
  rol: string | null
}

export interface LoginResponse {
  token: string
  usuario: UsuarioDto
}

// --- Rol ---
export interface Rol {
  id: number
  nombre: string
  descripcion: string
}

// --- Vehiculo ---
export interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  estado: string
}

// Valores válidos del campo estado (igual que en el backend)
export const ESTADOS_VEHICULO = ['Operativo', 'En mantenimiento', 'Fuera de servicio'] as const
export type EstadoVehiculo = typeof ESTADOS_VEHICULO[number]

export interface BitacoraFalla {
  id: number
  vehiculoId: number
  vehiculo?: Vehiculo | null
  usuarioId: number
  usuario?: UsuarioDto | null
  fechaReporte: string   // ISO 8601 string — el servidor usa DateTime UTC
  descripcion: string
  prioridad: string
  estadoFalla: string
}

export const PRIORIDADES = ['alta', 'media', 'baja'] as const
export type Prioridad = typeof PRIORIDADES[number]

export const ESTADOS_FALLA = ['pendiente', 'en revisión', 'resuelta'] as const
export type EstadoFalla = typeof ESTADOS_FALLA[number]

// --- Mantenimiento ---
export interface Mantenimiento {
  id: number
  vehiculoId: number
  fallaId: number | null
  tipo: string
  fechaProgramada: string  // ISO 8601
  costo: number
  tallerResponsable: string
  estado: string
}

export const TIPOS_MANTENIMIENTO = ['Preventivo', 'Correctivo'] as const
export const ESTADOS_MANTENIMIENTO = ['Programado', 'En proceso', 'Completado'] as const
