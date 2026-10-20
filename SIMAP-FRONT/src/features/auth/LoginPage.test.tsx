/**
 * LoginPage.test.tsx — Pruebas del formulario de inicio de sesión.
 */
import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginPage } from './LoginPage'
import { renderWithProviders } from '../../test/test-utils'

describe('LoginPage', () => {
  it('renderiza el formulario con sus campos y botón de envío accesible', () => {
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    expect(screen.getByRole('heading', { level: 1, name: /SIMAP/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar sesión/i })).toBeInTheDocument()
  })

  it('muestra mensajes de validación síncrona si los campos están vacíos', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    const botonSubmit = screen.getByRole('button', { name: /Iniciar sesión/i })
    await user.click(botonSubmit)

    expect(await screen.findByText(/El email es obligatorio/i)).toBeInTheDocument()
    expect(await screen.findByText(/La contraseña es obligatoria/i)).toBeInTheDocument()
  })

  it('muestra error de validación ante formato de correo inválido', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    const inputEmail = screen.getByLabelText(/Correo electrónico/i)
    await user.type(inputEmail, 'correo-no-valido')

    const botonSubmit = screen.getByRole('button', { name: /Iniciar sesión/i })
    await user.click(botonSubmit)

    expect(await screen.findByText(/Ingresa un email válido/i)).toBeInTheDocument()
  })

  it('muestra alerta accesible de error 401 si las credenciales son incorrectas', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'usuario@desconocido.cl')
    await user.type(screen.getByLabelText(/^Contraseña/i), 'clave-erronea')

    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }))

    const alertaError = await screen.findByRole('alert')
    expect(alertaError).toBeInTheDocument()
    expect(alertaError).toHaveTextContent(/Credenciales incorrectas/i)
  })

  it('inicia sesión exitosamente ante credenciales válidas y almacena la sesión', async () => {
    const user = userEvent.setup()
    renderWithProviders(<LoginPage />, { initialEntries: ['/login'] })

    await user.type(screen.getByLabelText(/Correo electrónico/i), 'admin@simap.cl')
    await user.type(screen.getByLabelText(/^Contraseña/i), '123456')

    await user.click(screen.getByRole('button', { name: /Iniciar sesión/i }))

    await waitFor(() => {
      expect(sessionStorage.getItem('simap_token')).toContain('eyJhbGciOiJIUzI1NiJ9')
      expect(sessionStorage.getItem('simap_usuario')).toContain('admin@simap.cl')
    })
  })
})
