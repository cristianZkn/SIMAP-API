/**
 * vehiculoService.ts — Servicio de Vehículos.
 * Todos los componentes que necesiten datos de vehículos llaman a estas
 * funciones, nunca a httpClient directamente.
 */
import { httpClient } from '../../shared/api/httpClient'
import type { Vehiculo } from '../../shared/types'

/** Obtiene la lista completa de vehículos. */
export async function obtenerVehiculos(): Promise<Vehiculo[]> {
  const { data } = await httpClient.get<Vehiculo[]>('/vehiculos')
  return data
}

/** Obtiene un vehículo por su ID. */
export async function obtenerVehiculo(id: number): Promise<Vehiculo> {
  const { data } = await httpClient.get<Vehiculo>(`/vehiculos/${id}`)
  return data
}

/** Crea un vehículo nuevo y retorna el objeto creado con su ID. */
export async function crearVehiculo(vehiculo: Omit<Vehiculo, 'id'>): Promise<Vehiculo> {
  const { data } = await httpClient.post<Vehiculo>('/vehiculos', vehiculo)
  return data
}

/** Actualiza todos los campos de un vehículo existente. */
export async function actualizarVehiculo(id: number, vehiculo: Omit<Vehiculo, 'id'>): Promise<Vehiculo> {
  const { data } = await httpClient.put<Vehiculo>(`/vehiculos/${id}`, vehiculo)
  return data
}

/** Elimina un vehículo. Retorna vacío (204 No Content). */
export async function eliminarVehiculo(id: number): Promise<void> {
  await httpClient.delete(`/vehiculos/${id}`)
}
