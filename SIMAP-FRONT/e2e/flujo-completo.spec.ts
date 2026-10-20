import { test, expect } from '@playwright/test'

test.describe('Flujo Completo de Negocio SIMAP (E2E)', () => {
  test('Login -> Navegación -> Creación de Vehículo -> Visualización en Listado', async ({
    page,
  }) => {
    const timestamp = Date.now()
    const emailAdmin = `admin_${timestamp}@simap.cl`
    const clave = '123456'
    const placaUnica = `E2E-${Math.floor(100 + Math.random() * 899)}`

    // 1. Registro inicial de un usuario Administrador (Rol: 2)
    await page.goto('/registro')
    await page.getByLabel(/Nombre completo/i).fill('Admin E2E Automático')
    await page.getByLabel(/Correo electrónico/i).fill(emailAdmin)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByLabel(/Rol asignado/i).selectOption('2')
    await page.getByRole('button', { name: /Crear cuenta/i }).click()

    // 2. Redirección y Login con las credenciales creadas
    await page.waitForURL('**/login', { timeout: 6000 })
    await page.getByLabel(/Correo electrónico/i).fill(emailAdmin)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    // 3. Navegación al recurso principal (/vehiculos)
    await page.waitForURL('**/vehiculos', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1, name: /Parque Automotor/i })).toBeVisible()

    // 4. Clic en "Registrar Vehículo" y navegación al formulario
    await page.getByRole('link', { name: /Registrar Vehículo/i }).click()
    await page.waitForURL('**/vehiculos/nuevo')
    await expect(page.getByRole('heading', { level: 1, name: /Registrar Nuevo Vehículo/i })).toBeVisible()

    // 5. Completar los campos del formulario con validación Zod
    await page.getByLabel(/Placa \/ Matrícula/i).fill(placaUnica)
    await page.getByLabel(/^Marca/i).fill('Toyota')
    await page.getByLabel(/^Modelo/i).fill('Hilux 4x4')
    await page.getByLabel(/Año de fabricación/i).fill('2024')
    await page.getByLabel(/Kilometraje actual/i).fill('18500')
    await page.getByLabel(/Estado operativo/i).selectOption('Operativo')

    // 6. Enviar formulario y esperar redirección
    await page.getByRole('button', { name: /Crear Vehículo/i }).click()
    await page.waitForURL('**/vehiculos', { timeout: 6000 })

    // 7. Verificar que la nueva unidad vehicular creada aparece en la tabla
    await expect(page.getByRole('heading', { level: 1, name: /Parque Automotor/i })).toBeVisible()
    await expect(page.getByText(placaUnica)).toBeVisible()
    await expect(page.getByRole('cell', { name: 'Toyota Hilux 4x4' }).first()).toBeVisible()
  })
})
