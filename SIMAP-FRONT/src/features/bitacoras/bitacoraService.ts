/**
 * bitacoraService.ts — Servicio de Bitácoras de Fallas.
 */
import { httpClient } from '../../shared/api/httpClient'
import type { BitacoraFalla } from '../../shared/types'

export async function obtenerBitacoras(): Promise<BitacoraFalla[]> {
  const { data } = await httpClient.get<BitacoraFalla[]>('/bitacoras')
  return data
}

export async function obtenerBitacora(id: number): Promise<BitacoraFalla> {
  const { data } = await httpClient.get<BitacoraFalla>(`/bitacoras/${id}`)
  return data
}

export async function crearBitacora(
  bitacora: Omit<BitacoraFalla, 'id'>,
): Promise<BitacoraFalla> {
  const { data } = await httpClient.post<BitacoraFalla>('/bitacoras', bitacora)
  return data
}

export async function actualizarBitacora(
  id: number,
  bitacora: Omit<BitacoraFalla, 'id'>,
): Promise<BitacoraFalla> {
  const { data } = await httpClient.put<BitacoraFalla>(`/bitacoras/${id}`, bitacora)
  return data
}

export async function eliminarBitacora(id: number): Promise<void> {
  await httpClient.delete(`/bitacoras/${id}`)
}
