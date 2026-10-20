/**
 * VehiculosListPage.tsx — Vista principal del CRUD de Vehículos.
 * 
 * Funcionalidades:
 * - Consulta con TanStack Query (cache, loading, error).
 * - Filtros de búsqueda (placa, marca, modelo) y estado con useSearchParams (URLs enlazables).
 * - Paginación del lado cliente accesible.
 * - Tabla responsiva (se transforma en tarjetas en dispositivos móviles).
 * - Eliminación segura mediante diálogo modal de confirmación accesible (WCAG 2.2).
 * - Feedback accesible en región aria-live.
 */
import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { obtenerVehiculos, eliminarVehiculo } from './vehiculoService'
import { ESTADOS_VEHICULO, type Vehiculo } from '../../shared/types'
import { Spinner } from '../../shared/components/Spinner'
import { ConfirmDialog } from '../../shared/components/ConfirmDialog'
import styles from './Vehiculos.module.css'

const ELEMENTOS_POR_PAGINA = 8

export function VehiculosListPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  // Estado del diálogo de confirmación de eliminación
  const [vehiculoAEliminar, setVehiculoAEliminar] = useState<Vehiculo | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)

  // Filtros desde la URL para mantener el estado enlazable
  const busqueda = searchParams.get('q') ?? ''
  const filtroEstado = searchParams.get('estado') ?? ''
  const paginaActual = Math.max(1, parseInt(searchParams.get('pagina') ?? '1', 10))

  // Consulta de datos con TanStack Query
  const {
    data: vehiculos = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: obtenerVehiculos,
  })

  // Mutación para eliminación con invalidación de caché
  const mutacionEliminar = useMutation({
    mutationFn: (id: number) => eliminarVehiculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehiculos'] })
      setVehiculoAEliminar(null)
      setMensajeExito('El vehículo ha sido eliminado del sistema con éxito.')
      setTimeout(() => setMensajeExito(null), 4000)
    },
    onError: (err: Error) => {
      alert(`Error al eliminar: ${err.message}`)
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
    // Reiniciar a la primera página ante cualquier cambio de filtro
    nuevosParams.set('pagina', '1')
    setSearchParams(nuevosParams)
  }

  const cambiarPagina = (nuevaPagina: number) => {
    const nuevosParams = new URLSearchParams(searchParams)
    nuevosParams.set('pagina', nuevaPagina.toString())
    setSearchParams(nuevosParams)
  }

  // Filtrado de vehículos en memoria
  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((v) => {
      const coincideTexto =
        v.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.marca.toLowerCase().includes(busqueda.toLowerCase()) ||
        v.modelo.toLowerCase().includes(busqueda.toLowerCase())

      const coincideEstado = filtroEstado ? v.estado === filtroEstado : true

      return coincideTexto && coincideEstado
    })
  }, [vehiculos, busqueda, filtroEstado])

  // Paginación
  const totalPaginas = Math.max(1, Math.ceil(vehiculosFiltrados.length / ELEMENTOS_POR_PAGINA))
  const vehiculosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ELEMENTOS_POR_PAGINA
    return vehiculosFiltrados.slice(inicio, inicio + ELEMENTOS_POR_PAGINA)
  }, [vehiculosFiltrados, paginaActual])

  return (
    <div className={styles.contenedor}>
      {/* Encabezado y Acción Principal */}
      <div className={styles.encabezadoSeccion}>
        <div>
          <h1 className={styles.titulo}>Parque Automotor</h1>
          <p className={styles.subtitulo}>
            Gestión y seguimiento de los vehículos operativos en la flota.
          </p>
        </div>
        <Link to="/vehiculos/nuevo" className={styles.btnNuevo}>
          Registrar Vehículo
        </Link>
      </div>

      {/* Región de mensajes en vivo (Accesibilidad) */}
      {mensajeExito && (
        <output aria-live="polite" className={`${styles.alertaEstado} ${styles.alertaExito}`}>
          <span>{mensajeExito}</span>
        </output>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <section aria-label="Filtros de vehículos" className={styles.barraFiltros}>
        <div className={styles.grupoFiltro}>
          <label htmlFor="busqueda-vehiculo">Buscar por placa, marca o modelo</label>
          <input
            id="busqueda-vehiculo"
            type="search"
            className={styles.inputFiltro}
            placeholder="Ejemplo: ABC-123, Toyota..."
            value={busqueda}
            onChange={(e) => actualizarFiltro('q', e.target.value)}
          />
        </div>

        <div className={styles.grupoFiltro}>
          <label htmlFor="filtro-estado-vehiculo">Filtrar por estado</label>
          <select
            id="filtro-estado-vehiculo"
            className={styles.selectFiltro}
            value={filtroEstado}
            onChange={(e) => actualizarFiltro('estado', e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_VEHICULO.map((est) => (
              <option key={est} value={est}>
                {est}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Estados de Carga y Error */}
      {isLoading && <Spinner mensaje="Cargando flota de vehículos..." />}

      {isError && (
        <div role="alert" className={`${styles.alertaEstado} ${styles.alertaError}`}>
          <span>Error al obtener vehículos: {(error as Error).message}</span>
          <button type="button" onClick={() => refetch()} className={styles.btnPagina}>
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de Datos o Estado Vacío */}
      {!isLoading && !isError && vehiculosFiltrados.length === 0 && (
        <div className={styles.estadoVacio}>
          <p>No se encontraron vehículos que coincidan con los criterios de búsqueda.</p>
        </div>
      )}

      {!isLoading && !isError && vehiculosFiltrados.length > 0 && (
        <>
          <section
            className={styles.tablaWrapper}
            aria-label="Tabla de vehículos"
          >
            <table className={styles.tabla}>
              <caption className="sr-only">Listado de unidades vehiculares</caption>
              <thead>
                <tr>
                  <th scope="col">Placa</th>
                  <th scope="col">Marca y Modelo</th>
                  <th scope="col">Año</th>
                  <th scope="col">Kilometraje</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculosPaginados.map((v) => (
                  <tr key={v.id}>
                    <td data-label="Placa">
                      <strong>{v.placa}</strong>
                    </td>
                    <td data-label="Marca y Modelo">
                      {v.marca} {v.modelo}
                    </td>
                    <td data-label="Año">{v.anio}</td>
                    <td data-label="Kilometraje">{v.kilometraje.toLocaleString()} km</td>
                    <td data-label="Estado">
                      <span
                        className={`${styles.badgeEstado} ${
                          v.estado === 'Operativo'
                            ? styles.estadoOperativo
                            : v.estado === 'En mantenimiento'
                            ? styles.estadoMantenimiento
                            : styles.estadoFueraServicio
                        }`}
                      >
                        {v.estado}
                      </span>
                    </td>
                    <td data-label="Acciones">
                      <div className={styles.accionesCol}>
                        <Link
                          to={`/vehiculos/${v.id}/editar`}
                          className={styles.btnEditar}
                          aria-label={`Editar vehículo placa ${v.placa}`}
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className={styles.btnEliminar}
                          onClick={() => setVehiculoAEliminar(v)}
                          aria-label={`Eliminar vehículo placa ${v.placa}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Barra de Paginación */}
          <nav aria-label="Paginación de vehículos" className={styles.paginacion}>
            <span className={styles.infoPaginacion}>
              Mostrando {vehiculosPaginados.length} de {vehiculosFiltrados.length} vehículos (Página{' '}
              {paginaActual} de {totalPaginas})
            </span>
            <div className={styles.botonesPaginacion}>
              <button
                type="button"
                className={styles.btnPagina}
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual <= 1}
                aria-label="Ir a la página anterior"
              >
                Anterior
              </button>
              <button
                type="button"
                className={styles.btnPagina}
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual >= totalPaginas}
                aria-label="Ir a la página siguiente"
              >
                Siguiente
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Diálogo modal de confirmación accesible para eliminar */}
      <ConfirmDialog
        abierto={vehiculoAEliminar !== null}
        titulo="Confirmar eliminación de vehículo"
        mensaje={`¿Está seguro de que desea eliminar el vehículo ${vehiculoAEliminar?.marca} ${vehiculoAEliminar?.modelo} con placa "${vehiculoAEliminar?.placa}"? Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar Vehículo"
        cargando={mutacionEliminar.isPending}
        onConfirmar={() => {
          if (vehiculoAEliminar) {
            mutacionEliminar.mutate(vehiculoAEliminar.id)
          }
        }}
        onCancelar={() => setVehiculoAEliminar(null)}
      />
    </div>
  )
}
