import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CatalogosProvider } from '../../shared/catalogosContext'
import { ConfiguracionCatalogosPage } from './ConfiguracionCatalogosPage'

describe('ConfiguracionCatalogosPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renderiza las tres secciones de catálogos y sus títulos accesibles', () => {
    render(
      <MemoryRouter>
        <CatalogosProvider>
          <ConfiguracionCatalogosPage />
        </CatalogosProvider>
      </MemoryRouter>
    )

    expect(
      screen.getByRole('heading', { level: 1, name: /Configuración de Estados y Prioridades/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Prioridades de Falla/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Estados de Bitácoras/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /Estados de Flota/i })
    ).toBeInTheDocument()
  })

  it('permite añadir una nueva prioridad personalizada y la muestra en la lista', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CatalogosProvider>
          <ConfiguracionCatalogosPage />
        </CatalogosProvider>
      </MemoryRouter>
    )

    const inputPrioridad = screen.getByLabelText(/Nombre de nueva prioridad/i)
    const btnAgregar = screen.getAllByRole('button', { name: /^Añadir$/i })[0]

    await user.type(inputPrioridad, 'Urgente')
    await user.click(btnAgregar)

    expect(screen.getByText('urgente')).toBeInTheDocument()
    expect(
      screen.getByText(/Nivel de prioridad "Urgente" agregado exitosamente/i)
    ).toBeInTheDocument()
  })

  it('evita agregar prioridades duplicadas y anuncia el error', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CatalogosProvider>
          <ConfiguracionCatalogosPage />
        </CatalogosProvider>
      </MemoryRouter>
    )

    const inputPrioridad = screen.getByLabelText(/Nombre de nueva prioridad/i)
    const btnAgregar = screen.getAllByRole('button', { name: /^Añadir$/i })[0]

    await user.type(inputPrioridad, 'alta')
    await user.click(btnAgregar)

    expect(
      screen.getByText(/La prioridad "alta" ya existe o no es válida/i)
    ).toBeInTheDocument()
  })

  it('permite eliminar un nivel de prioridad y anuncia el éxito', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CatalogosProvider>
          <ConfiguracionCatalogosPage />
        </CatalogosProvider>
      </MemoryRouter>
    )

    const btnEliminarCritica = screen.getByRole('button', { name: /Eliminar prioridad crítica/i })
    await user.click(btnEliminarCritica)

    expect(screen.queryByText(/^crítica$/i)).not.toBeInTheDocument()
    expect(
      screen.getByText(/Nivel de prioridad "crítica" eliminado del catálogo/i)
    ).toBeInTheDocument()
  })

  it('restablece los catálogos a sus valores predeterminados al hacer clic en restablecer', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <CatalogosProvider>
          <ConfiguracionCatalogosPage />
        </CatalogosProvider>
      </MemoryRouter>
    )

    // Eliminar crítica
    const btnEliminarCritica = screen.getByRole('button', { name: /Eliminar prioridad crítica/i })
    await user.click(btnEliminarCritica)
    expect(screen.queryByText(/^crítica$/i)).not.toBeInTheDocument()

    // Clic en restablecer
    const btnRestablecer = screen.getByRole('button', {
      name: /Restablecer Valores Predeterminados/i,
    })
    await user.click(btnRestablecer)

    expect(screen.getByText('crítica')).toBeInTheDocument()
    expect(
      screen.getByText(/Se han restablecido los catálogos a sus valores predeterminados/i)
    ).toBeInTheDocument()
  })
})
