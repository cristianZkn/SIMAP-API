/**
 * server.ts — Inicializa el servidor de pruebas Mock Service Worker en entorno Node/jsdom.
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
