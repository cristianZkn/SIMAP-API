/**
 * test-utils.tsx — Envoltorio con proveedores para pruebas de componentes React.
 */
import type { ReactElement, ReactNode } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import { AuthProvider } from '../features/auth/AuthContext'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: MemoryRouterProps['initialEntries']
  queryClient?: QueryClient
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  }
}
