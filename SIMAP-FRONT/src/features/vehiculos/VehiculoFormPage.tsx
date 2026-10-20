/**
 * VehiculoFormPage.tsx — Formulario de Creación y Edición de Vehículos.
 * 
 * Funcionalidades:
 * - Modo dinámico: Creación (/vehiculos/nuevo) o Edición (/vehiculos/:id/editar).
 * - Validación estricta con React Hook Form y Zod que replica las reglas del servidor.
 * - Carga previa de datos en modo edición con TanStack Query.
 * - Mutaciones con TanStack Query e invalidación de caché.
 * - Accesibilidad (WCAG 2.2): labels asociados, aria-invalid, aria-describedby, estados de error.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerVehiculo, crearVehiculo, actualizarVehiculo } from './vehiculoService'
import { ESTADOS_VEHICULO, type EstadoVehiculo } from '../../shared/types'
import { Spinner } from '../../shared/components/Spinner'
import type { ApiError } from '../../shared/api/httpClient'
import styles from './Vehiculos.module.css'

const vehiculoSchema = z.object({
  placa: z
    .string()
    .min(1, 'La placa es obligatoria')
    .max(10, 'La placa no puede exceder 10 caracteres')
    .toUpperCase(),
  marca: z.string().min(1, 'La marca es obligatoria'),
  modelo: z.string().min(1, 'El modelo es obligatorio'),
  anio: z
    .number()
    .int('El año debe ser un número entero')
    .min(1900, 'El año debe ser mayor a 1900')
    .max(new Date().getFullYear() + 1, `El año no puede exceder ${new Date().getFullYear() + 1}`),
  kilometraje: z
    .number()
    .min(0, 'El kilometraje no puede ser negativo'),
  estado: z.enum(['Operativo', 'En mantenimiento', 'Fuera de servicio']),
})

type VehiculoFormData = z.infer<typeof vehiculoSchema>

export function VehiculoFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const esEdicion = Boolean(id)
  const vehiculoId = id ? parseInt(id, 10) : 0

  const [errorServidor, setErrorServidor] = useState<string | null>(null)

  // Consulta de datos existentes en modo edición
  const { data: vehiculoExistente, isLoading: cargandoVehiculo } = useQuery({
    queryKey: ['vehiculo', vehiculoId],
    queryFn: () => obtenerVehiculo(vehiculoId),
    enabled: esEdicion && !isNaN(vehiculoId),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: {
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      kilometraje: 0,
      estado: 'Operativo',
    },
  })

  // Poblar formulario cuando se obtienen los datos del vehículo
  useEffect(() => {
    if (vehiculoExistente) {
      reset({
        placa: vehiculoExistente.placa,
        marca: vehiculoExistente.marca,
        modelo: vehiculoExistente.modelo,
        anio: vehiculoExistente.anio,
        kilometraje: vehiculoExistente.kilometraje,
        estado: vehiculoExistente.estado as EstadoVehiculo,
      })
    }
  }, [vehiculoExistente, reset])

  // Mutación para creación o actualización
  const mutacionGuardar = useMutation({
    mutationFn: async (datos: VehiculoFormData) => {
      if (esEdicion) {
        return actualizarVehiculo(vehiculoId, datos)
      }
      return crearVehiculo(datos)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] })
      if (esEdicion) {
        queryClient.invalidateQueries({ queryKey: ['vehiculo', vehiculoId] })
      }
      navigate('/vehiculos')
    },
    onError: (err: ApiError) => {
      setErrorServidor(err.message || 'Ocurrió un error al procesar el vehículo.')
    },
  })

  const onSubmit = (datos: VehiculoFormData) => {
    setErrorServidor(null)
    mutacionGuardar.mutate(datos)
  }

  if (esEdicion && cargandoVehiculo) {
    return <Spinner mensaje="Cargando información del vehículo..." />
  }

  return (
    <div className={styles.contenedor}>
      <div className={styles.encabezadoSeccion}>
        <div>
          <h1 className={styles.titulo}>
            {esEdicion ? `Editar Vehículo #${vehiculoId}` : 'Registrar Nuevo Vehículo'}
          </h1>
          <p className={styles.subtitulo}>
            {esEdicion
              ? 'Actualice los datos técnicos y operativos de la unidad vehicular.'
              : 'Complete los datos requeridos para dar de alta una nueva unidad en la flota.'}
          </p>
        </div>
      </div>

      <div className={styles.tarjetaFormulario}>
        {errorServidor && (
          <div role="alert" aria-live="assertive" className={`${styles.alertaEstado} ${styles.alertaError}`}>
            <span>{errorServidor}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de vehículo">
          <div className={styles.gridCampos}>
            {/* Campo Placa */}
            <div className={styles.campo}>
              <label htmlFor="placa">Placa / Matrícula</label>
              <input
                id="placa"
                type="text"
                autoComplete="off"
                aria-describedby={errors.placa ? 'placa-error' : undefined}
                aria-invalid={!!errors.placa}
                {...register('placa')}
              />
              {errors.placa && (
                <span id="placa-error" role="alert" className={styles.errorCampo}>
                  {errors.placa.message}
                </span>
              )}
            </div>

            {/* Campo Marca */}
            <div className={styles.campo}>
              <label htmlFor="marca">Marca</label>
              <input
                id="marca"
                type="text"
                aria-describedby={errors.marca ? 'marca-error' : undefined}
                aria-invalid={!!errors.marca}
                {...register('marca')}
              />
              {errors.marca && (
                <span id="marca-error" role="alert" className={styles.errorCampo}>
                  {errors.marca.message}
                </span>
              )}
            </div>

            {/* Campo Modelo */}
            <div className={styles.campo}>
              <label htmlFor="modelo">Modelo</label>
              <input
                id="modelo"
                type="text"
                aria-describedby={errors.modelo ? 'modelo-error' : undefined}
                aria-invalid={!!errors.modelo}
                {...register('modelo')}
              />
              {errors.modelo && (
                <span id="modelo-error" role="alert" className={styles.errorCampo}>
                  {errors.modelo.message}
                </span>
              )}
            </div>

            {/* Campo Año */}
            <div className={styles.campo}>
              <label htmlFor="anio">Año de fabricación</label>
              <input
                id="anio"
                type="number"
                aria-describedby={errors.anio ? 'anio-error' : undefined}
                aria-invalid={!!errors.anio}
                {...register('anio', { valueAsNumber: true })}
              />
              {errors.anio && (
                <span id="anio-error" role="alert" className={styles.errorCampo}>
                  {errors.anio.message}
                </span>
              )}
            </div>

            {/* Campo Kilometraje */}
            <div className={styles.campo}>
              <label htmlFor="kilometraje">Kilometraje actual (km)</label>
              <input
                id="kilometraje"
                type="number"
                min={0}
                aria-describedby={errors.kilometraje ? 'kilometraje-error' : undefined}
                aria-invalid={!!errors.kilometraje}
                {...register('kilometraje', { valueAsNumber: true })}
              />
              {errors.kilometraje && (
                <span id="kilometraje-error" role="alert" className={styles.errorCampo}>
                  {errors.kilometraje.message}
                </span>
              )}
            </div>

            {/* Campo Estado */}
            <div className={styles.campo}>
              <label htmlFor="estado">Estado operativo</label>
              <select
                id="estado"
                aria-describedby={errors.estado ? 'estado-error' : undefined}
                aria-invalid={!!errors.estado}
                {...register('estado')}
              >
                {ESTADOS_VEHICULO.map((est) => (
                  <option key={est} value={est}>
                    {est}
                  </option>
                ))}
              </select>
              {errors.estado && (
                <span id="estado-error" role="alert" className={styles.errorCampo}>
                  {errors.estado.message}
                </span>
              )}
            </div>
          </div>

          <div className={styles.accionesFormulario}>
            <Link to="/vehiculos" className={styles.btnCancelar}>
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
                ? 'Actualizar Vehículo'
                : 'Crear Vehículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
