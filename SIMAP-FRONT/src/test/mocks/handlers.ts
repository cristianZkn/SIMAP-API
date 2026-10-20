/**
 * handlers.ts — Manejadores de red para Mock Service Worker (MSW).
 * Intercepta las llamadas a la API durante las pruebas unitarias y de integración.
 */
import { http, HttpResponse } from 'msw'
import type { Vehiculo, BitacoraFalla } from '../../shared/types'

export const vehiculosMock: Vehiculo[] = [
  {
    id: 1,
    placa: 'ABC-123',
    marca: 'Toyota',
    modelo: 'Hilux',
    anio: 2022,
    kilometraje: 45000,
    estado: 'Operativo',
  },
  {
    id: 2,
    placa: 'XYZ-789',
    marca: 'Ford',
    modelo: 'Ranger',
    anio: 2021,
    kilometraje: 78000,
    estado: 'En mantenimiento',
  },
]

export const bitacorasMock: BitacoraFalla[] = [
  {
    id: 1,
    vehiculoId: 1,
    usuarioId: 1,
    descripcion: 'Ruidos en pastillas de freno delanteras',
    prioridad: 'alta',
    estadoFalla: 'pendiente',
    fechaReporte: '2026-10-18T12:00:00Z',
    vehiculo: vehiculosMock[0],
  },
]

export const handlers = [
  // Auth: Login
  http.post('*/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    if (body.email === 'admin@simap.cl' && body.password === '123456') {
      const payloadB64 = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 7200, rol: 'Admin' }))
      return HttpResponse.json({
        token: `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.fakesignature`,
        usuario: {
          id: 1,
          nombre: 'Administrador SIMAP',
          email: 'admin@simap.cl',
          rol: 'Admin',
          activo: true,
        },
      })
    }
    return HttpResponse.json(
      { error: 'Credenciales inválidas. Comprueba tu correo y contraseña.' },
      { status: 401 }
    )
  }),

  // Auth: Registro
  http.post('*/api/v1/auth/registro', async () => {
    return HttpResponse.json(
      {
        id: 3,
        nombre: 'Nuevo Usuario',
        email: 'nuevo@simap.cl',
        rol: 'Conductor',
        activo: true,
      },
      { status: 201 }
    )
  }),

  // Vehículos: Listado
  http.get('*/api/v1/vehiculos', () => {
    return HttpResponse.json(vehiculosMock)
  }),

  // Vehículos: Detalle por ID
  http.get('*/api/v1/vehiculos/:id', ({ params }) => {
    const id = Number(params.id)
    const vehiculo = vehiculosMock.find((v) => v.id === id)
    if (!vehiculo) {
      return HttpResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
    }
    return HttpResponse.json(vehiculo)
  }),

  // Vehículos: Creación
  http.post('*/api/v1/vehiculos', async ({ request }) => {
    const nuevo = (await request.json()) as Omit<Vehiculo, 'id'>
    const creado: Vehiculo = { id: 3, ...nuevo }
    return HttpResponse.json(creado, { status: 201 })
  }),

  // Vehículos: Actualización
  http.put('*/api/v1/vehiculos/:id', async ({ request, params }) => {
    const id = Number(params.id)
    const datos = (await request.json()) as Partial<Vehiculo>
    return HttpResponse.json({ id, ...datos })
  }),

  // Vehículos: Eliminación
  http.delete('*/api/v1/vehiculos/:id', () => {
    return HttpResponse.json({ mensaje: 'Vehículo eliminado con éxito' })
  }),

  // Bitácoras: Listado
  http.get('*/api/v1/bitacoras', () => {
    return HttpResponse.json(bitacorasMock)
  }),
]
