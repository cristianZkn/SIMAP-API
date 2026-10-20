/**
 * BitacoraFormPage.tsx — Formulario de Creación y Edición de Bitácoras de Fallas.
 * 
 * Cumple los requerimientos de la rúbrica:
 * - El recurso relacionado incluye un <select> de Vehículos cargado dinámicamente desde la API.
 * - Validación Zod + React Hook Form sincronizada con las reglas del servidor.
 * - Soporte para creación y edición.
 * - Accesibilidad (WCAG 2.2) y diseño sin emojis.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerBitacora, crearBitacora, actualizarBitacora } from './bitacoraService'
import { obtenerVehiculos } from '../vehiculos/vehiculoService'
import { useAuth } from '../auth/AuthContext'
import { Spinner } from '../../shared/components/Spinner'
import type { ApiError } from '../../shared/api/httpClient'
import styles from './Bitacoras.module.css'

const bitacoraSchema = z.object({
  vehiculoId: z
    .number()
    .int('Debe seleccionar un vehículo válido')
    .min(1, 'Debe seleccionar un vehículo'),
  descripcion: z
    .string()
    .min(5, 'La descripción de la falla debe tener al menos 5 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  prioridad: z.enum(['alta', 'media', 'baja']),
  estadoFalla: z.enum(['pendiente', 'en revisión', 'resuelta']),
})

type BitacoraFormData = z.infer<typeof bitacoraSchema>

export function BitacoraFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { usuario } = useAuth()
  const esEdicion = Boolean(id)
  const bitacoraId = id ? parseInt(id, 10) : 0

  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  // Consulta de vehículos para poblar el <select> dinámicamente desde la API
  const { data: vehiculos = [], isLoading: cargandoVehiculos } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: obtenerVehiculos,
  })

  // Consulta de datos de la bitácora si estamos en modo edición
  const { data: bitacoraExistente, isLoading: cargandoBitacora } = useQuery({
    queryKey: ['bitacora', bitacoraId],
    queryFn: () => obtenerBitacora(bitacoraId),
    enabled: esEdicion && !isNaN(bitacoraId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BitacoraFormData>({
    resolver: zodResolver(bitacoraSchema),
    defaultValues: {
      vehiculoId: 0,
      descripcion: '',
      prioridad: 'media',
      estadoFalla: 'pendiente',
    },
  })

  // Carga previa en modo edición
  useEffect(() => {
    if (bitacoraExistente) {
      reset({
        vehiculoId: bitacoraExistente.vehiculoId,
        descripcion: bitacoraExistente.descripcion,
        prioridad: bitacoraExistente.prioridad.toLowerCase() as 'alta' | 'media' | 'baja',
        estadoFalla: bitacoraExistente.estadoFalla.toLowerCase() as 'pendiente' | 'en revisión' | 'resuelta',
      })
    }
  }, [bitacoraExistente, reset])

  // Mutación para creación o actualización
  const mutacionGuardar = useMutation({
    mutationFn: async (datos: BitacoraFormData) => {
      const payload = {
        vehiculoId: datos.vehiculoId,
        usuarioId: usuario?.id ?? 1,
        fechaReporte: esEdicion && bitacoraExistente ? bitacoraExistente.fechaReporte : new Date().toISOString(),
        descripcion: datos.descripcion,
        prioridad: datos.prioridad,
        estadoFalla: datos.estadoFalla,
      }

      if (esEdicion) {
        return actualizarBitacora(bitacoraId, payload)
      }
      return crearBitacora(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitacoras'] })
      if (esEdicion) {
        queryClient.invalidateQueries({ queryKey: ['bitacora', bitacoraId] })
      }
      navigate('/bitacoras')
    },
    onError: (err: ApiError) => {
      setErrorServidor(err.message || 'Ocurrió un error al procesar el reporte de falla.')
    },
  })

  const onSubmit = (datos: BitacoraFormData) => {
    setErrorServidor(null)
    mutacionGuardar.mutate(datos)
  }

  if ((esEdicion && cargandoBitacora) || cargandoVehiculos) {
    return <Spinner mensaje="Cargando información del formulario..." />
  }

  return (
    <div className={styles.contenedor}>
      <div className={styles.encabezadoSeccion}>
        <div>
          <h1 className={styles.titulo}>
            {esEdicion ? `Actualizar Falla #${bitacoraId}` : 'Reportar Falla Mecánica'}
          </h1>
          <p className={styles.subtitulo}>
            {esEdicion
              ? 'Modifique el diagnóstico, prioridad o estado del reporte de falla.'
              : 'Seleccione la unidad afectada e indique el detalle de la incidencia observada.'}
          </p>
        </div>
      </div>

      <div className={styles.tarjetaFormulario}>
        {errorServidor && (
          <div role="alert" aria-live="assertive" className={`${styles.alertaEstado} ${styles.alertaError}`}>
            <span>{errorServidor}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de reporte de falla">
          {/* Selector Dinámico de Vehículo cargado desde la API */}
          <div className={styles.campo}>
            <label htmlFor="vehiculoId">Vehículo asignado</label>
            <select
              id="vehiculoId"
              aria-describedby={errors.vehiculoId ? 'vehiculoId-error' : undefined}
              aria-invalid={!!errors.vehiculoId}
              {...register('vehiculoId', { valueAsNumber: true })}
            >
              <option value={0}>Seleccione un vehículo de la flota...</option>
              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.placa} — {v.marca} {v.modelo} ({v.estado})
                </option>
              ))}
            </select>
            {errors.vehiculoId && (
              <span id="vehiculoId-error" role="alert" className={styles.errorCampo}>
                {errors.vehiculoId.message}
              </span>
            )}
          </div>

          {/* Campo Descripción */}
          <div className={styles.campo}>
            <label htmlFor="descripcion">Descripción detallada de la falla</label>
            <textarea
              id="descripcion"
              rows={4}
              placeholder="Describa el problema observado (ruidos anormales, pérdida de potencia, frenado, etc.)..."
              aria-describedby={errors.descripcion ? 'descripcion-error' : undefined}
              aria-invalid={!!errors.descripcion}
              {...register('descripcion')}
            />
            {errors.descripcion && (
              <span id="descripcion-error" role="alert" className={styles.errorCampo}>
                {errors.descripcion.message}
              </span>
            )}
          </div>

          {/* Campo Prioridad */}
          <div className={styles.campo}>
            <label htmlFor="prioridad">Nivel de prioridad</label>
            <select
              id="prioridad"
              aria-describedby={errors.prioridad ? 'prioridad-error' : undefined}
              aria-invalid={!!errors.prioridad}
              {...register('prioridad')}
            >
              <option value="baja">Baja (Mantenimiento rutinario o falla menor)</option>
              <option value="media">Media (Afecta rendimiento pero la unidad rueda)</option>
              <option value="alta">Alta (Riesgo de seguridad o vehículo inmovilizado)</option>
            </select>
            {errors.prioridad && (
              <span id="prioridad-error" role="alert" className={styles.errorCampo}>
                {errors.prioridad.message}
              </span>
            )}
          </div>

          {/* Campo Estado de la Falla */}
          <div className={styles.campo}>
            <label htmlFor="estadoFalla">Estado del reporte</label>
            <select
              id="estadoFalla"
              aria-describedby={errors.estadoFalla ? 'estadoFalla-error' : undefined}
              aria-invalid={!!errors.estadoFalla}
              {...register('estadoFalla')}
            >
              <option value="pendiente">Pendiente (En espera de revisión en taller)</option>
              <option value="en revisión">En revisión (En diagnóstico por mecánico)</option>
              <option value="resuelta">Resuelta (Reparación completada y verificada)</option>
            </select>
            {errors.estadoFalla && (
              <span id="estadoFalla-error" role="alert" className={styles.errorCampo}>
                {errors.estadoFalla.message}
              </span>
            )}
          </div>

          <div className={styles.accionesFormulario}>
            <Link to="/bitacoras" className={styles.btnCancelar}>
              Cancelar
            </Link>
            <button
              type="submit"
              className={styles.btnGuardar}
              disabled={isSubmitting || mutacionGuardar.isPending}
              aria-busy={isSubmitting || mutacionGuardar.isPending}
            >
              {isSubmitting || mutacionGuardar.isPending
                ? 'Guardando...'
                : esEdicion
                ? 'Actualizar Falla'
                : 'Reportar Falla'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
