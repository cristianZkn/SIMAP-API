/**
 * VehiculosCrud.test.tsx — Pruebas de integración del flujo CRUD de vehículos.
 */
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../test/mocks/server'
import { VehiculosListPage } from './VehiculosListPage'
import { renderWithProviders } from '../../test/test-utils'

describe('Flujo CRUD de Vehículos (VehiculosListPage)', () => {
  it('muestra el indicador de carga accesible mientras se consultan los vehículos', () => {
    renderWithProviders(<VehiculosListPage />, { initialEntries: ['/vehiculos'] })

    expect(screen.getByRole('status')).toHaveTextContent(/Cargando flota de vehículos/i)
  })

  it('renderiza la lista de vehículos obtenida desde la API con sus datos y badges', async () => {
    renderWithProviders(<VehiculosListPage />, { initialEntries: ['/vehiculos'] })

    // Esperar a que desaparezca el spinner y se rendericen las placas
    expect(await screen.findByText('ABC-123')).toBeInTheDocument()
    expect(screen.getByText(/Toyota Hilux/i)).toBeInTheDocument()
    expect(screen.getByText('XYZ-789')).toBeInTheDocument()
    expect(screen.getByText(/Ford Ranger/i)).toBeInTheDocument()
    expect(screen.getAllByText('Operativo').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('En mantenimiento').length).toBeGreaterThanOrEqual(1)
  })

  it('filtra los registros en tiempo real al escribir en la barra de búsqueda', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehiculosListPage />, { initialEntries: ['/vehiculos'] })

    expect(await screen.findByText('ABC-123')).toBeInTheDocument()
    expect(screen.getByText('XYZ-789')).toBeInTheDocument()

    const inputBusqueda = screen.getByLabelText(/Buscar por placa, marca o modelo/i)
    await user.type(inputBusqueda, 'Toyota')

    // Toyota Hilux (ABC-123) permanece, Ford Ranger (XYZ-789) desaparece
    expect(screen.getByText('ABC-123')).toBeInTheDocument()
    expect(screen.queryByText('XYZ-789')).not.toBeInTheDocument()
  })

  it('muestra mensaje accesible de estado vacío si la búsqueda no tiene coincidencias', async () => {
    const user = userEvent.setup()
    renderWithProviders(<VehiculosListPage />, { initialEntries: ['/vehiculos'] })

    expect(await screen.findByText('ABC-123')).toBeInTheDocument()

    const inputBusqueda = screen.getByLabelText(/Buscar por placa, marca o modelo/i)
    await user.type(inputBusqueda, 'PlacaInexistente999')

    expect(
      await screen.findByText(/No se encontraron vehículos que coincidan con los criterios/i)
    ).toBeInTheDocument()
  })

  it('maneja errores de red mostrando mensaje de alerta y opción de reintentar', async () => {
    // Sobrescribir el endpoint GET para simular falla de servidor 500
    server.use(
      http.get('*/api/v1/vehiculos', () => {
        return HttpResponse.json({ message: 'Error interno en la base de datos' }, { status: 500 })
      })
    )

    renderWithProviders(<VehiculosListPage />, { initialEntries: ['/vehiculos'] })

    const alerta = await screen.findByRole('alert')
    expect(alerta).toBeInTheDocument()
    expect(alerta).toHaveTextContent(/Error al obtener vehículos/i)

    const botonReintentar = screen.getByRole('button', { name: /Reintentar/i })
    expect(botonReintentar).toBeInTheDocument()
  })
})
