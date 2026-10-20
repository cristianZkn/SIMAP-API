/**
 * RegisterPage.tsx — Página accesible de Registro de Usuarios.
 * 
 * Permite registrar usuarios en el backend (POST /api/v1/auth/registro)
 * con selección de rol (Admin, Mecánico, Conductor) para poder probar
 * los diferentes niveles de autorización y guards del Trabajo 2.
 */
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { registrar } from './authService'
import type { ApiError } from '../../shared/api/httpClient'
import styles from './LoginPage.module.css'

// Esquema Zod de validación que replica las restricciones del backend
const registroSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().min(1, 'El correo electrónico es obligatorio').email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rolId: z.number().refine((val) => [1, 2, 4].includes(val), {
    message: 'Selecciona un rol válido para tu cuenta',
  }),
})

type RegistroFormData = z.infer<typeof registroSchema>

export function RegisterPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const [registroExitoso, setRegistroExitoso] = useState<boolean>(false)
  const nombreRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistroFormData>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      rolId: 4, // Conductor por defecto
    },
  })

  // Si ya está autenticado, redirige al inicio
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  // Foco inicial accesible en el campo Nombre
  useEffect(() => {
    nombreRef.current?.focus()
  }, [])

  async function onSubmit(datos: RegistroFormData) {
    setErrorServidor(null)
    setRegistroExitoso(false)
    try {
      await registrar(datos)
      setRegistroExitoso(true)
      // Redirigir al login tras 2 segundos para que el usuario pueda ingresar con su nueva cuenta
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    } catch (err) {
      const apiError = err as ApiError
      setErrorServidor(apiError.message)
    }
  }

  const { ref: rhfNombreRef, ...nombreRest } = register('nombre')

  return (
    <div className={styles.contenedor}>
      <main id="contenido-principal" className={styles.tarjeta}>
        <h1 className={styles.titulo}>Crear Cuenta</h1>
        <p className={styles.subtitulo}>Registro de usuario en SIMAP</p>

        {registroExitoso && (
          <div role="status" aria-live="polite" className={styles.alertaExito}>
            ✅ ¡Cuenta creada con éxito! Redirigiendo al inicio de sesión…
          </div>
        )}

        {errorServidor && (
          <div role="alert" aria-live="assertive" className={styles.errorServidor}>
            {errorServidor}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de registro">
          {/* Campo Nombre */}
          <div className={styles.campo}>
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              autoComplete="name"
              aria-describedby={errors.nombre ? 'nombre-error' : undefined}
              aria-invalid={!!errors.nombre}
              {...nombreRest}
              ref={(el) => {
                rhfNombreRef(el)
                nombreRef.current = el
              }}
            />
            {errors.nombre && (
              <span id="nombre-error" role="alert" className={styles.errorCampo}>
                {errors.nombre.message}
              </span>
            )}
          </div>

          {/* Campo Email */}
          <div className={styles.campo}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <span id="email-error" role="alert" className={styles.errorCampo}>
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className={styles.campo}>
            <label htmlFor="password">Contraseña (mínimo 6 caracteres)</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <span id="password-error" role="alert" className={styles.errorCampo}>
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Selector de Rol */}
          <div className={styles.campo}>
            <label htmlFor="rolId">Rol asignado</label>
            <select
              id="rolId"
              aria-describedby={errors.rolId ? 'rolId-error' : undefined}
              aria-invalid={!!errors.rolId}
              {...register('rolId', { valueAsNumber: true })}
            >
              <option value={4}>Conductor (Acceso a Bitácora de fallas)</option>
              <option value={1}>Mecánico (Vehículos, Fallas y Mantenimiento)</option>
              <option value={2}>Administrador (Acceso total al sistema)</option>
            </select>
            {errors.rolId && (
              <span id="rolId-error" role="alert" className={styles.errorCampo}>
                {errors.rolId.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.botonPrimario}
            disabled={isSubmitting || registroExitoso}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Registrando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        <p className={styles.enlaceRegistro}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
        </p>
      </main>
    </div>
  )
}
