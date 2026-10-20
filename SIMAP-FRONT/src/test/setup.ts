/**
 * setup.ts — Configuración global del entorno de pruebas de Vitest.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'
import axios from 'axios'
import { server } from './mocks/server'

// Configurar Axios para usar fetch nativo interceptado por MSW en jsdom
axios.defaults.adapter = 'fetch'

// Iniciar interceptor de red MSW antes de los tests
beforeAll(() => {
  server.listen()
})

// Limpiar manejadores y DOM después de cada test
afterEach(() => {
  server.resetHandlers()
  cleanup()
  sessionStorage.clear()
  vi.clearAllMocks()
})

// Cerrar el servidor MSW al finalizar
afterAll(() => {
  server.close()
})

// Polyfills para el entorno jsdom
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
