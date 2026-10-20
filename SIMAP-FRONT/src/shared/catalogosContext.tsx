/* oxlint-disable react/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface CatalogosState {
  prioridades: string[]
  estadosFalla: string[]
  estadosVehiculo: string[]
}

export const CATALOGOS_PREDETERMINADOS: CatalogosState = {
  prioridades: ['crítica', 'alta', 'media', 'baja'],
  estadosFalla: ['pendiente', 'en revisión', 'resuelta'],
  estadosVehiculo: ['Operativo', 'En mantenimiento', 'Fuera de servicio'],
}

const STORAGE_KEY = 'simap_catalogos'

function cargarCatalogosIniciales(): CatalogosState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CatalogosState>
      return {
        prioridades:
          Array.isArray(parsed.prioridades) && parsed.prioridades.length > 0
            ? parsed.prioridades
            : CATALOGOS_PREDETERMINADOS.prioridades,
        estadosFalla:
          Array.isArray(parsed.estadosFalla) && parsed.estadosFalla.length > 0
            ? parsed.estadosFalla
            : CATALOGOS_PREDETERMINADOS.estadosFalla,
        estadosVehiculo:
          Array.isArray(parsed.estadosVehiculo) && parsed.estadosVehiculo.length > 0
            ? parsed.estadosVehiculo
            : CATALOGOS_PREDETERMINADOS.estadosVehiculo,
      }
    }
  } catch {
    // Si localStorage falla o está restringido, devolver predeterminados
  }
  return CATALOGOS_PREDETERMINADOS
}

export interface CatalogosContextType extends CatalogosState {
  agregarPrioridad: (nombre: string) => boolean
  eliminarPrioridad: (nombre: string) => boolean
  agregarEstadoFalla: (nombre: string) => boolean
  eliminarEstadoFalla: (nombre: string) => boolean
  agregarEstadoVehiculo: (nombre: string) => boolean
  eliminarEstadoVehiculo: (nombre: string) => boolean
  restablecerPredeterminados: () => void
}

const CatalogosContext = createContext<CatalogosContextType | null>(null)

export function CatalogosProvider({ children }: { children: ReactNode }) {
  const [catalogos, setCatalogos] = useState<CatalogosState>(cargarCatalogosIniciales)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogos))
    } catch {
      // Ignorar errores de cuota o modo privado
    }
  }, [catalogos])

  const agregarPrioridad = (nombre: string): boolean => {
    const limpio = nombre.trim().toLowerCase()
    if (!limpio || catalogos.prioridades.some((p) => p.toLowerCase() === limpio)) {
      return false
    }
    setCatalogos((prev) => ({
      ...prev,
      prioridades: [...prev.prioridades, limpio],
    }))
    return true
  }

  const eliminarPrioridad = (nombre: string): boolean => {
    const limpio = nombre.trim().toLowerCase()
    if (catalogos.prioridades.length <= 1) return false
    setCatalogos((prev) => ({
      ...prev,
      prioridades: prev.prioridades.filter((p) => p.toLowerCase() !== limpio),
    }))
    return true
  }

  const agregarEstadoFalla = (nombre: string): boolean => {
    const limpio = nombre.trim().toLowerCase()
    if (!limpio || catalogos.estadosFalla.some((e) => e.toLowerCase() === limpio)) {
      return false
    }
    setCatalogos((prev) => ({
      ...prev,
      estadosFalla: [...prev.estadosFalla, limpio],
    }))
    return true
  }

  const eliminarEstadoFalla = (nombre: string): boolean => {
    const limpio = nombre.trim().toLowerCase()
    if (catalogos.estadosFalla.length <= 1) return false
    setCatalogos((prev) => ({
      ...prev,
      estadosFalla: prev.estadosFalla.filter((e) => e.toLowerCase() !== limpio),
    }))
    return true
  }

  const agregarEstadoVehiculo = (nombre: string): boolean => {
    const limpio = nombre.trim()
    if (!limpio || catalogos.estadosVehiculo.some((e) => e.toLowerCase() === limpio.toLowerCase())) {
      return false
    }
    setCatalogos((prev) => ({
      ...prev,
      estadosVehiculo: [...prev.estadosVehiculo, limpio],
    }))
    return true
  }

  const eliminarEstadoVehiculo = (nombre: string): boolean => {
    if (catalogos.estadosVehiculo.length <= 1) return false
    setCatalogos((prev) => ({
      ...prev,
      estadosVehiculo: prev.estadosVehiculo.filter((e) => e.toLowerCase() !== nombre.toLowerCase()),
    }))
    return true
  }

  const restablecerPredeterminados = () => {
    setCatalogos(CATALOGOS_PREDETERMINADOS)
  }

  return (
    <CatalogosContext.Provider
      value={{
        ...catalogos,
        agregarPrioridad,
        eliminarPrioridad,
        agregarEstadoFalla,
        eliminarEstadoFalla,
        agregarEstadoVehiculo,
        eliminarEstadoVehiculo,
        restablecerPredeterminados,
      }}
    >
      {children}
    </CatalogosContext.Provider>
  )
}

export function useCatalogos(): CatalogosContextType {
  const ctx = useContext(CatalogosContext)
  if (!ctx) {
    // Retorno seguro con predeterminados si se llama fuera de CatalogosProvider (p.ej. tests unitarios aislados)
    return {
      ...CATALOGOS_PREDETERMINADOS,
      agregarPrioridad: () => false,
      eliminarPrioridad: () => false,
      agregarEstadoFalla: () => false,
      eliminarEstadoFalla: () => false,
      agregarEstadoVehiculo: () => false,
      eliminarEstadoVehiculo: () => false,
      restablecerPredeterminados: () => {},
    }
  }
  return ctx
}
