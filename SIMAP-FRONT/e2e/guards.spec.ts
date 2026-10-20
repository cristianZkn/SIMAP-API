import { test, expect } from '@playwright/test'

test.describe('Guards de Seguridad y Protección de Rutas (E2E)', () => {
  test('intento de acceder a ruta protegida sin autenticación redirige a /login con parámetro de retorno', async ({
    page,
  }) => {
    // 1. Intentar acceder directamente a la ruta protegida /vehiculos sin haber iniciado sesión
    await page.goto('/vehiculos')

    // 2. Verificar que se redirige a /login con el parámetro retorno
    await expect(page).toHaveURL(/\/login\?retorno=%2Fvehiculos/)

    // 3. Verificar que se renderiza el formulario de login accesible
    await expect(page.getByRole('heading', { level: 1, name: /SIMAP/i })).toBeVisible()
    await expect(page.getByLabel(/Correo electrónico/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Iniciar sesión/i })).toBeVisible()
  })

  test('intento de acceder a ruta no autorizada por rol redirige a /403 Acceso Denegado', async ({
    page,
  }) => {
    const timestamp = Date.now()
    const emailConductor = `conductor_${timestamp}@simap.cl`
    const clave = '123456'

    // 1. Registrar una cuenta con rol Conductor (ID: 4)
    await page.goto('/registro')
    await page.getByLabel(/Nombre completo/i).fill('Conductor E2E')
    await page.getByLabel(/Correo electrónico/i).fill(emailConductor)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByLabel(/Rol asignado/i).selectOption('4')
    await page.getByRole('button', { name: /Crear cuenta/i }).click()

    // 2. Esperar la redirección automática al login
    await page.waitForURL('**/login', { timeout: 6000 })

    // 3. Iniciar sesión con la cuenta de conductor
    await page.getByLabel(/Correo electrónico/i).fill(emailConductor)
    await page.getByLabel(/^Contraseña/i).fill(clave)
    await page.getByRole('button', { name: /Iniciar sesión/i }).click()

    // 4. Al iniciar sesión, la app intenta navegar a la raíz (/vehiculos).
    // El RoleGuard detecta que el usuario tiene rol Conductor y redirige de inmediato a /403
    await page.waitForURL('**/403', { timeout: 8000 })
    await expect(page).toHaveURL(/\/403/)
    await expect(page.getByText('403')).toBeVisible()
    await expect(page.getByRole('heading', { name: /Acceso restringido/i })).toBeVisible()
  })
})
