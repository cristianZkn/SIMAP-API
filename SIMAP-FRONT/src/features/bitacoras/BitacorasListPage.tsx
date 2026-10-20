/**
 * BitacorasListPage.tsx — Listado y administración de Bitácoras de Fallas.
 * 
 * Funcionalidades:
 * - Consulta asíncrona con TanStack Query (cache, loading, error).
 * - Cruce de información con el recurso de Vehículos.
 * - Filtros por texto descriptivo, prioridad y estado con useSearchParams (URLs enlazables).
 * - Paginación del lado cliente accesible.
 * - Tabla responsiva con adaptación a tarjetas en dispositivos móviles.
 * - Eliminación segura con ConfirmDialog modal accesible.
 * - Formato localizado de fechas sin uso de emojis.
 */
import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerBitacoras, eliminarBitacora, actualizarBitacora } from './bitacoraService'
import { obtenerVehiculos } from '../vehiculos/vehiculoService'
import { useAuth } from '../auth/AuthContext'
import { type BitacoraFalla, type Vehiculo } from '../../shared/types'
import { useCatalogos } from '../../shared/catalogosContext'
import { Spinner } from '../../shared/components/Spinner'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import styles from './Bitacoras.module.css'

const ELEMENTOS_POR_PAGINA = 8

export function BitacorasListPage() {
  const { rol } = useAuth()
  const { prioridades, estadosFalla } = useCatalogos()
  const esAdmin = rol === 'Admin'
  const esMecanico = rol === 'Mecanico'
  const puedeReportar = rol === 'Admin' || rol === 'Conductor'
  const tieneColumnaAcciones = esAdmin || esMecanico

  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const [bitacoraAEliminar, setBitacoraAEliminar] = useState<BitacoraFalla | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Filtros desde URL
  const busqueda = searchParams.get('q') ?? ''
  const filtroPrioridad = searchParams.get('prioridad') ?? ''
  const filtroEstado = searchParams.get('estado') ?? ''
  const paginaActual = Math.max(1, parseInt(searchParams.get('pagina') ?? '1', 10))

  // Consulta de bitácoras
  const {
    data: bitacoras = [],
    isLoading: cargandoBitacoras,
    isError: errorBitacoras,
    error,
    refetch,
  } = useQuery({
    queryKey: ['bitacoras'],
    queryFn: obtenerBitacoras,
  })

  // Consulta de vehículos para mapear información en la tabla
  const { data: vehiculos = [] } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: obtenerVehiculos,
  })

  // Mapa de vehículos por ID para acceso rápido O(1)
  const vehiculosPorId = useMemo(() => {
    const mapa = new Map<number, Vehiculo>()
    for (const v of vehiculos) {
      mapa.set(v.id, v)
    }
    return mapa
  }, [vehiculos])

  // Mutación para eliminación con invalidación de caché
  const mutacionEliminar = useMutation({
    mutationFn: (id: number) => eliminarBitacora(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitacoras'] })
      setBitacoraAEliminar(null)
      setMensajeExito('El reporte de falla ha sido eliminado correctamente.')
      setTimeout(() => setMensajeExito(null), 4000)
    },
    onError: (err: Error) => {
      alert(`Error al eliminar: ${err.message}`)
    },
  })

  // Mutación rápida de cambio de estado para Mecánico
  const mutacionCambiarEstado = useMutation({
    mutationFn: ({ id, bitacora, nuevoEstado }: { id: number; bitacora: BitacoraFalla; nuevoEstado: string }) =>
      actualizarBitacora(id, {
        vehiculoId: bitacora.vehiculoId,
        usuarioId: bitacora.usuarioId,
        fechaReporte: bitacora.fechaReporte,
        descripcion: bitacora.descripcion,
        prioridad: bitacora.prioridad,
        estadoFalla: nuevoEstado,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitacoras'] })
      setMensajeExito('El estado de la falla ha sido actualizado correctamente.')
      setTimeout(() => setMensajeExito(null), 4000)
    },
    onError: (err: Error) => {
      alert(`Error al actualizar estado: ${err.message}`)
    },
  })

  // Actualización de parámetros en la URL
  const actualizarFiltro = (clave: string, valor: string) => {
    const nuevosParams = new URLSearchParams(searchParams)
    if (valor) {
      nuevosParams.set(clave, valor)
    } else {
      nuevosParams.delete(clave)
    }
    nuevosParams.set('pagina', '1')
    setSearchParams(nuevosParams)
  }

  const cambiarPagina = (nuevaPagina: number) => {
    const nuevosParams = new URLSearchParams(searchParams)
    nuevosParams.set('pagina', nuevaPagina.toString())
    setSearchParams(nuevosParams)
  }

  // Filtrado de bitácoras en memoria
  const bitacorasFiltradas = useMemo(() => {
    return bitacoras.filter((b) => {
      const vehiculoAsociado = b.vehiculo ?? vehiculosPorId.get(b.vehiculoId)
      const textoVehiculo = vehiculoAsociado ? `${vehiculoAsociado.placa} ${vehiculoAsociado.marca}` : ''

      const coincideTexto =
        b.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        textoVehiculo.toLowerCase().includes(busqueda.toLowerCase())

      const normalizar = (texto: string) =>
        texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

      const coincidePrioridad = filtroPrioridad
        ? normalizar(b.prioridad) === normalizar(filtroPrioridad)
        : true
      const coincideEstado = filtroEstado
        ? normalizar(b.estadoFalla) === normalizar(filtroEstado)
        : true

      return coincideTexto && coincidePrioridad && coincideEstado
    })
  }, [bitacoras, busqueda, filtroPrioridad, filtroEstado, vehiculosPorId])

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(bitacorasFiltradas.length / ELEMENTOS_POR_PAGINA))
  const bitacorasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA
    return bitacorasFiltradas.slice(inicio, inicio + ELEMENTOS_POR_PAGINA)
  }, [bitacorasFiltradas, paginaActual])

  const formatearFecha = (fechaIso: string) => {
    try {
      const fecha = new Date(fechaIso)
      return new Intl.DateTimeFormat('es-ES', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(fecha)
    } catch {
      return fechaIso
    }
  }

  return (
    <div className={styles.contenedor}>
      {/* Encabezado y Acción */}
      <div className={styles.encabezadoSeccion}>
        <div>
          <h1 className={styles.titulo}>Bitácora de Fallas</h1>
          <p className={styles.subtitulo}>
            Registro, diagnóstico y seguimiento de incidencias mecánicas reportadas en la flota.
          </p>
        </div>
        {puedeReportar && (
          <Link to="/bitacoras/nueva" className={styles.btnNuevo}>
            Reportar Falla
          </Link>
        )}
      </div>

      {/* Mensajes de éxito */}
      {mensajeExito && (
        <output aria-live="polite" className={`${styles.alertaEstado} ${styles.alertaExito}`}>
          <span>{mensajeExito}</span>
        </output>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <section aria-label="Filtros de bitácora" className={styles.barraFiltros}>
        <div className={styles.grupoFiltro}>
          <label htmlFor="busqueda-bitacora">Buscar por descripción o vehículo</label>
          <input
            id="busqueda-bitacora"
            type="search"
            className={styles.inputFiltro}
            placeholder="Ejemplo: frenos, motor, ABC-123..."
            value={busqueda}
            onChange={(e) => actualizarFiltro('q', e.target.value)}
          />
        </div>

        <div className={styles.grupoFiltro}>
          <label htmlFor="filtro-prioridad">Prioridad</label>
          <select
            id="filtro-prioridad"
            className={styles.selectFiltro}
            value={filtroPrioridad}
            onChange={(e) => actualizarFiltro('prioridad', e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            {prioridades.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.grupoFiltro}>
          <label htmlFor="filtro-estado-falla">Estado de la falla</label>
          <select
            id="filtro-estado-falla"
            className={styles.selectFiltro}
            value={filtroEstado}
            onChange={(e) => actualizarFiltro('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            {estadosFalla.map((est) => (
              <option key={est} value={est}>
                {est.charAt(0).toUpperCase() + est.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Estados de Carga y Error */}
      {cargandoBitacoras && <Spinner mensaje="Cargando bitácoras de fallas..." />}

      {errorBitacoras && (
        <div role="alert" className={`${styles.alertaEstado} ${styles.alertaError}`}>
          <span>Error al consultar bitácoras: {(error as Error).message}</span>
          <button type="button" onClick={() => refetch()} className={styles.btnPagina}>
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de Resultados o Estado Vacío */}
      {!cargandoBitacoras && !errorBitacoras && bitacorasFiltradas.length === 0 && (
        <div className={styles.estadoVacio}>
          <p>No se encontraron bitácoras que coincidan con los filtros aplicados.</p>
        </div>
      )}

      {!cargandoBitacoras && !errorBitacoras && bitacorasFiltradas.length > 0 && (
        <>
          <section
            className={styles.tablaWrapper}
            aria-label="Tabla de reportes de fallas"
          >
            <table className={styles.tabla}>
              <caption className="sr-only">Listado de reportes de fallas</caption>
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Vehículo</th>
                  <th scope="col">Descripción</th>
                  <th scope="col">Prioridad</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Fecha de Reporte</th>
                  {tieneColumnaAcciones && <th scope="col">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {bitacorasPaginadas.map((b) => {
                  const vehiculo = b.vehiculo ?? vehiculosPorId.get(b.vehiculoId)
                  const prioridadLower = b.prioridad.toLowerCase()
                  const estadoLower = b.estadoFalla.toLowerCase()

                  return (
                    <tr key={b.id}>
                      <td data-label="ID">#{b.id}</td>
                      <td data-label="Vehículo">
                        <strong>{vehiculo ? `${vehiculo.placa} — ${vehiculo.marca} ${vehiculo.modelo}` : `Vehículo #${b.vehiculoId}`}</strong>
                      </td>
                      <td data-label="Descripción">{b.descripcion}</td>
                      <td data-label="Prioridad">
                        <span
                          className={`${styles.badgePrioridad} ${
                            prioridadLower === 'crítica' || prioridadLower === 'critica'
                              ? styles.prioridadCritica
                              : prioridadLower === 'alta'
                                ? styles.prioridadAlta
                                : prioridadLower === 'media'
                                  ? styles.prioridadMedia
                                  : styles.prioridadBaja
                          }`}
                        >
                          {b.prioridad}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <span
                          className={`${styles.badgeEstado} ${estadoLower === 'pendiente'
                            ? styles.estadoPendiente
                            : estadoLower === 'resuelta'
                              ? styles.estadoResuelta
                              : styles.estadoRevision
                            }`}
                        >
                          {b.estadoFalla}
                        </span>
                      </td>
                      <td data-label="Fecha de Reporte">{formatearFecha(b.fechaReporte)}</td>
                      {tieneColumnaAcciones && (
                        <td data-label="Acciones">
                          <div className={styles.accionesCol}>
                            {esAdmin && (
                              <>
                                <Link
                                  to={`/bitacoras/${b.id}/editar`}
                                  className={styles.btnEditar}
                                  aria-label={`Editar reporte de falla número ${b.id}`}
                                >
                                  Editar
                                </Link>
                                <button
                                  type="button"
                                  className={styles.btnEliminar}
                                  onClick={() => setBitacoraAEliminar(b)}
                                  aria-label={`Eliminar reporte de falla número ${b.id}`}
                                >
                                  Eliminar
                                </button>
                              </>
                            )}
                            {esMecanico && (
                              <>
                                <select
                                  value={b.estadoFalla.toLowerCase()}
                                  onChange={(e) =>
                                    mutacionCambiarEstado.mutate({
                                      id: b.id,
                                      bitacora: b,
                                      nuevoEstado: e.target.value,
                                    })
                                  }
                                  className={styles.selectFiltro}
                                  style={{ minHeight: '36px', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                                  aria-label={`Modificar estado de falla número ${b.id}`}
                                >
                                  {estadosFalla.map((est) => (
                                    <option key={est} value={est}>
                                      {est.charAt(0).toUpperCase() + est.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <Link
                                  to={`/bitacoras/${b.id}/editar`}
                                  className={styles.btnEditar}
                                  aria-label={`Detalle y estado de falla número ${b.id}`}
                                >
                                  Estado
                                </Link>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          {/* Navegación y Paginación */}
          <nav aria-label="Paginación de bitácoras" className={styles.paginacion}>
            <span className={styles.infoPaginacion}>
              Mostrando {bitacorasPaginadas.length} de {bitacorasFiltradas.length} bitácoras (Página{' '}
              {paginaActual} de {totalPaginas})
            </span>
            <div className={styles.botonesPaginacion}>
              <button
                type="button"
                className={styles.btnPagina}
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                aria-label="Ir a la página anterior de bitácoras"
              >
                Anterior
              </button>
              <button
                type="button"
                className={styles.btnPagina}
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                aria-label="Ir a la página siguiente de bitácoras"
              >
                Siguiente
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Diálogo de Confirmación Accesible */}
      <ConfirmDialog
        abierto={bitacoraAEliminar !== null}
        titulo="Confirmar eliminación de bitácora"
        mensaje={`¿Está seguro de que desea eliminar el reporte de falla #${bitacoraAEliminar?.id} ("${bitacoraAEliminar?.descripcion}")? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar Bitácora"
        cargando={mutacionEliminar.isPending}
        onConfirmar={() => {
          if (bitacoraAEliminar) {
            mutacionEliminar.mutate(bitacoraAEliminar.id)
          }
        }}
        onCancelar={() => setBitacoraAEliminar(null)}
      />
    </div>
  )
}
