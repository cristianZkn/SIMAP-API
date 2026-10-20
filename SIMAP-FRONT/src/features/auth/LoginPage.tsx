/**
 * LoginPage.tsx — Página de inicio de sesión.
 * 
 * Accesibilidad:
 * - Campos con <label> asociado
 * - Errores con aria-describedby + aria-invalid
 * - Mensaje de error en región aria-live para lectores de pantalla
 * - Botón deshabilitado durante el envío (evita doble submit)
 * - Foco inicial en el campo email
 */
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { login } from './authService'
import type { ApiError } from '../../shared/api/httpClient'
import styles from './LoginPage.module.css'

// Esquema Zod: replica las reglas de validación del backend
const loginSchema = z.object({
  email: z.string().min(1, 'El email es obligatorio').email('Ingresa un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login: guardarSesion, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [errorServidor, setErrorServidor] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Si ya está autenticado, redirige directo
  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  // Foco inicial en el campo email (accesibilidad)
  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  async function onSubmit(datos: LoginFormData) {
    setErrorServidor(null)
    try {
      const respuesta = await login(datos)
      guardarSesion(respuesta.token, respuesta.usuario)
      // Redirige a la ruta original si existe, o a la raíz
      const retorno = searchParams.get('retorno') ?? '/'
      navigate(decodeURIComponent(retorno), { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      setErrorServidor(apiError.message)
    }
  }

  // Integra el ref de react-hook-form con nuestro ref para el foco
  const { ref: rhfRef, ...emailRest } = register('email')

  return (
    <div className={styles.contenedor}>
      <main id="contenido-principal" className={styles.tarjeta}>
        <h1 className={styles.titulo}>SIMAP</h1>
        <p className={styles.subtitulo}>Sistema de Mantenimiento de Parque Automotor</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de inicio de sesión">
          {/* Mensaje de error del servidor — anunciado por lectores de pantalla */}
          {errorServidor && (
            <div role="alert" aria-live="assertive" className={styles.errorServidor}>
              {errorServidor}
            </div>
          )}

          <div className={styles.campo}>
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              {...emailRest}
              ref={(el) => {
                rhfRef(el)
                emailRef.current = el
              }}
            />
            {errors.email && (
              <span id="email-error" role="alert" className={styles.errorCampo}>
                {errors.email.message}
              </span>
            )}
          </div>

          <div className={styles.campo}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
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

          <button
            type="submit"
            className={styles.botonPrimario}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <p className={styles.enlaceRegistro}>
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </main>
    </div>
  )
}
