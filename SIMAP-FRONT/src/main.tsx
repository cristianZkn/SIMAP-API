// Punto de entrada de la aplicación React
// Monta el árbol de componentes sobre el div#root del index.html
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './features/auth/AuthContext'
import { CatalogosProvider } from './shared/catalogosContext'
import App from './App'
import './index.css'

// Cliente de TanStack Query: maneja el cache, revalidación y estados de carga/error
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,              // Un solo reintento en caso de error de red
      staleTime: 1000 * 30,  // Los datos son frescos por 30 segundos
    },
  },
})

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento #root en el HTML')

createRoot(rootElement).render(
  <StrictMode>
    {/* BrowserRouter: habilita la navegación del lado del cliente */}
    <BrowserRouter>
      {/* QueryClientProvider: pone el cache de TanStack Query disponible en toda la app */}
      <QueryClientProvider client={queryClient}>
        {/* AuthProvider: expone el estado de sesión (token, usuario, rol) en toda la app */}
        <AuthProvider>
          <CatalogosProvider>
            <App />
          </CatalogosProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
