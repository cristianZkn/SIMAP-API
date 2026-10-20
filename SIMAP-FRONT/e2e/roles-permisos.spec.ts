import { test, expect } from '@playwright/test'

test.describe('Verificación de Roles y Permisos (Mecánico y Conductor)', () => {
  test('Conductor puede ver bitácoras y reportar fallas seleccionando un vehículo', async ({ page }) => {
    const timestamp = Date.now()
    const emailConductor = `conductor_test_${timestamp}@simap.cl`
    const clave = '123456'
    const descripcionFalla = `Falla reportada por conductor ${timestamp}: Ruido extraño en motor`

    // 1. Registro de Conductor (Rol: 4)
    await page.goto('/registro')
    await page.getByLabel(/Nombre completo/i).fill('Conductor Validador')
    await page.getByLabel(/Correo electrónico/i).fill(emailConductor)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByLabel(/Rol asignado/i).selectOption('4')
    await page.getByRole('button', { name: /Crear cuenta/i }).click()

    // 2. Login
    await page.waitForURL('**/login', { timeout: 6000 })
    await page.getByLabel(/Correo electrónico/i).fill(emailConductor)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    // 3. Llega al Dashboard sin errores 403
    await page.waitForURL('**/', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1, name: /Panel de Control/i })).toBeVisible()

    // 4. Navegar a Bitácoras de Fallas
    await page.getByRole('link', { name: 'Bitácoras de Fallas', exact: true }).click()
    await page.waitForURL('**/bitacoras', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1, name: /Bitácora de Fallas/i })).toBeVisible()

    // 5. Conductor ve botón "Reportar Falla"
    const btnReportar = page.getByRole('link', { name: /Reportar Falla/i })
    await expect(btnReportar).toBeVisible()
    await btnReportar.click()

    // 6. En formulario /bitacoras/nueva, el select de vehículos debe tener opciones cargadas
    await page.waitForURL('**/bitacoras/nueva', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1, name: /Reportar Falla Mecánica/i })).toBeVisible()

    const selectVehiculo = page.getByLabel(/Vehículo asignado/i)
    await expect(selectVehiculo).toBeVisible()

    // Esperar a que las opciones de vehículos se carguen desde la API
    await expect(selectVehiculo.locator('option')).not.toHaveCount(1)

    // Seleccionar el primer vehículo disponible (índice 1, tras el placeholder)
    await selectVehiculo.selectOption({ index: 1 })

    // Completar descripción y prioridad
    await page.getByLabel(/Descripción detallada/i).fill(descripcionFalla)
    await page.getByLabel(/Nivel de prioridad/i).selectOption('alta')

    // Enviar formulario
    await page.getByRole('button', { name: /Reportar Falla/i }).click()

    // 7. Redirige a /bitacoras y la falla aparece en la lista
    await page.waitForURL('**/bitacoras', { timeout: 6000 })
    await expect(page.getByText(descripcionFalla)).toBeVisible()
  })

  test('Mecánico visualiza vehículos y bitácoras sin botones de modificación de vehículos ni eliminación', async ({ page }) => {
    const timestamp = Date.now()
    const emailMecanico = `mecanico_test_${timestamp}@simap.cl`
    const clave = '123456'

    // 1. Registro de Mecánico (Rol: 1)
    await page.goto('/registro')
    await page.getByLabel(/Nombre completo/i).fill('Mecánico Taller')
    await page.getByLabel(/Correo electrónico/i).fill(emailMecanico)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByLabel(/Rol asignado/i).selectOption('1')
    await page.getByRole('button', { name: /Crear cuenta/i }).click()

    // 2. Login
    await page.waitForURL('**/login', { timeout: 6000 })
    await page.getByLabel(/Correo electrónico/i).fill(emailMecanico)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    // 3. Navegar a /vehiculos: puede visualizar la flota
    await page.waitForURL('**/', { timeout: 6000 })
    await page.getByRole('link', { name: 'Vehículos', exact: true }).click()
    await page.waitForURL('**/vehiculos', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1, name: /M[oó]dulo de Gesti[oó]n Automotriz/i })).toBeVisible()

    // 4. Mecánico NO ve botón "Registrar Vehículo" ni columna "Acciones" con botones Editar/Eliminar
    await expect(page.getByRole('link', { name: /Registrar Vehículo/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /Eliminar/i })).not.toBeVisible()

    // 5. Navegar a /bitacoras
    await page.getByRole('link', { name: 'Bitácoras de Fallas', exact: true }).click()
    await page.waitForURL('**/bitacoras', { timeout: 6000 })
    await expect(page.getByRole('heading', { level: 1, name: /Bitácora de Fallas/i })).toBeVisible()

    // 6. Mecánico NO ve botón "Reportar Falla" ni botón "Eliminar"
    await expect(page.getByRole('link', { name: /Reportar Falla/i })).not.toBeVisible()
    await expect(page.getByRole('button', { name: /Eliminar/i })).not.toBeVisible()

    // 7. Mecánico sí ve el control para modificar el estado
    const selectEstado = page.locator('select[aria-label^="Modificar estado de falla"]').first()
    await expect(selectEstado).toBeVisible()
  })
})
