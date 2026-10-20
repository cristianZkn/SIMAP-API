/**
 * DashboardPage.tsx — Pagina Principal con metricas y graficos analiticos.
 * 
 * Funcionalidades:
 * - Consulta asincrona de Vehiculos y Bitacoras con TanStack Query.
 * - Indicadores clave de rendimiento (KPIs de flota y operacion).
 * - Grafico 1: Estado Operativo de los Vehiculos (SVG Donut accesible).
 * - Grafico 2: Distribucion de la Flota por Marca (Grafico de barras horizontales).
 * - Grafico 3: Clasificacion de Incidencias en Bitacoras segun Prioridad.
 * - Accesibilidad universal (WCAG 2.2 AA) con tablas equivalentes ocultas para lectores de pantalla.
 * - Estetica sobria, moderna y limpia inspirada en la ingenieria de ECC.
 */
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { obtenerVehiculos } from '../vehiculos/vehiculoService'
import { obtenerBitacoras } from '../bitacoras/bitacoraService'
import { useAuth } from '../auth/AuthContext'
import { Spinner } from '../../shared/components/Spinner'
import styles from './Dashboard.module.css'

export function DashboardPage() {
  const { rol } = useAuth()

  // Consulta de datos con cache reactivo de TanStack Query
  const {
    data: vehiculos = [],
    isLoading: cargandoVehiculos,
    isError: errorVehiculos,
    refetch: recargarVehiculos,
  } = useQuery({
    queryKey: ['vehiculos'],
    queryFn: obtenerVehiculos,
  })

  const {
    data: bitacoras = [],
    isLoading: cargandoBitacoras,
    isError: errorBitacoras,
    refetch: recargarBitacoras,
  } = useQuery({
    queryKey: ['bitacoras'],
    queryFn: obtenerBitacoras,
  })

  // -------------------------------------------------------------
  // Metricas de Vehiculos (Estados y Marcas)
  // -------------------------------------------------------------
  const metricasVehiculos = useMemo(() => {
    const total = vehiculos.length

    let operativos = 0
    let mantenimiento = 0
    let fueraServicio = 0

    const conteoMarcas: Record<string, number> = {}

    vehiculos.forEach((v) => {
      const est = (v.estado || '').toLowerCase()
      if (est.includes('disp') || est.includes('oper')) {
        operativos++
      } else if (est.includes('mant') || est.includes('taller')) {
        mantenimiento++
      } else {
        fueraServicio++
      }

      const marcaNormalizada = (v.marca || 'Sin Marca').trim()
      conteoMarcas[marcaNormalizada] = (conteoMarcas[marcaNormalizada] || 0) + 1
    })

    const marcasOrdenadas = Object.entries(conteoMarcas)
      .map(([marca, cantidad]) => ({
        marca,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 100) : 0,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5)

    const pctOperativos = total > 0 ? Math.round((operativos / total) * 100) : 0
    const pctMantenimiento = total > 0 ? Math.round((mantenimiento / total) * 100) : 0
    const pctFueraServicio = total > 0 ? Math.max(0, 100 - pctOperativos - pctMantenimiento) : 0

    return {
      total,
      operativos,
      mantenimiento,
      fueraServicio,
      pctOperativos,
      pctMantenimiento,
      pctFueraServicio,
      marcasOrdenadas,
    }
  }, [vehiculos])

  // -------------------------------------------------------------
  // Metricas de Bitacoras (Prioridades y Estados)
  // -------------------------------------------------------------
  const metricasBitacoras = useMemo(() => {
    const total = bitacoras.length

    let critica = 0
    let alta = 0
    let media = 0
    let baja = 0

    let pendientes = 0
    let resueltas = 0

    bitacoras.forEach((b) => {
      const prio = (b.prioridad || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

      if (prio.includes('crit') || prio.includes('urg')) critica++
      else if (prio.includes('alt')) alta++
      else if (prio.includes('med')) media++
      else baja++

      const est = (b.estadoFalla || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()

      if (est.includes('resuel')) resueltas++
      else pendientes++
    })

    return {
      total,
      critica,
      alta,
      media,
      baja,
      pendientes,
      resueltas,
      pctCritica: total > 0 ? Math.round((critica / total) * 100) : 0,
      pctAlta: total > 0 ? Math.round((alta / total) * 100) : 0,
      pctMedia: total > 0 ? Math.round((media / total) * 100) : 0,
      pctBaja: total > 0 ? Math.round((baja / total) * 100) : 0,
    }
  }, [bitacoras])

  if (cargandoVehiculos || cargandoBitacoras) {
    return (
      <div className={styles.centrado}>
        <Spinner mensaje="Cargando panel de control y métricas del sistema..." />
      </div>
    )
  }

  if (errorVehiculos || errorBitacoras) {
    return (
      <div className={styles.contenedor}>
        <div role="alert" className={styles.alertaError}>
          <p>Ocurrio un problema al consultar los datos del panel de control.</p>
          <button
            type="button"
            className={styles.btnReintentar}
            onClick={() => {
              recargarVehiculos()
              recargarBitacoras()
            }}
          >
            Reintentar carga de datos
          </button>
        </div>
      </div>
    )
  }

  // Calculo de offsets para el SVG Donut (circunferencia = 100 con r = 15.9155)
  const offsetMantenimiento = 100 - metricasVehiculos.pctOperativos
  const offsetFueraServicio = offsetMantenimiento - metricasVehiculos.pctMantenimiento

  return (
    <div className={styles.contenedor}>
      {/* Encabezado */}
      <header className={styles.encabezado}>
        <div>
          <h1 className={styles.titulo}>Panel de Control — SIMAP</h1>
          <p className={styles.subtitulo}>
            Sistema de Mantenimiento Preventivo — Resumen analítico de la flota y gestión operativa de incidencias.
          </p>
        </div>
      </header>

      {/* Fila de Tarjetas KPI */}
      <section aria-label="Indicadores clave de rendimiento" className={styles.gridKpis}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiEtiqueta}>Flota Vehicular</span>
          <div className={styles.kpiValor}>{metricasVehiculos.total}</div>
          <p className={styles.kpiDetalle}>Unidades totales registradas</p>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiEtiqueta}>Disponibilidad</span>
          <div className={styles.kpiValor}>{metricasVehiculos.pctOperativos}%</div>
          <p className={`${styles.kpiDetalle} ${styles.kpiDetallePositivo}`}>
            {metricasVehiculos.operativos} unidades operativas
          </p>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiEtiqueta}>En Mantenimiento</span>
          <div className={styles.kpiValor}>{metricasVehiculos.mantenimiento}</div>
          <p className={styles.kpiDetalle}>
            {metricasVehiculos.pctMantenimiento}% de la flota en taller
          </p>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiEtiqueta}>Incidencias Activas</span>
          <div className={styles.kpiValor}>{metricasBitacoras.pendientes}</div>
          <p className={`${styles.kpiDetalle} ${metricasBitacoras.critica > 0 ? styles.kpiDetalleAlerta : ''}`}>
            {metricasBitacoras.critica} con severidad crítica
          </p>
        </div>
      </section>

      {/* Grid de Gráficos Analíticos */}
      <section aria-label="Gráficos de estado y clasificación" className={styles.gridGraficos}>
        
        {/* Gráfico 1: Estado Operativo de los Vehículos */}
        <article className={styles.graficoCard}>
          <div className={styles.graficoEncabezado}>
            <h2 className={styles.graficoTitulo}>Estado de los Vehículos</h2>
            <span className={styles.graficoSubtitulo}>Disponibilidad operativa</span>
          </div>

          <figure aria-label="Gráfico de distribución del estado de vehículos" className={styles.donutContainer}>
            <div className={styles.donutWrapper}>
              <svg
                viewBox="0 0 42 42"
                className={styles.svgDonut}
                aria-label={`Flota vehicular: ${metricasVehiculos.pctOperativos}% operativos, ${metricasVehiculos.pctMantenimiento}% en mantenimiento, ${metricasVehiculos.pctFueraServicio}% fuera de servicio`}
              >
                {/* Fondo base */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="var(--color-border)"
                  strokeWidth="5"
                />
                {/* Segmento: Operativos (Verde) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#22c55e"
                  strokeWidth="5"
                  strokeDasharray={`${metricasVehiculos.pctOperativos} ${100 - metricasVehiculos.pctOperativos}`}
                  strokeDashoffset="0"
                />
                {/* Segmento: En Mantenimiento (Ámbar) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth="5"
                  strokeDasharray={`${metricasVehiculos.pctMantenimiento} ${100 - metricasVehiculos.pctMantenimiento}`}
                  strokeDashoffset={offsetMantenimiento}
                />
                {/* Segmento: Fuera de Servicio (Rojo) */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#ef4444"
                  strokeWidth="5"
                  strokeDasharray={`${metricasVehiculos.pctFueraServicio} ${100 - metricasVehiculos.pctFueraServicio}`}
                  strokeDashoffset={offsetFueraServicio}
                />
              </svg>

              {/* Centro de información HTML perfectamente centrado y sin sobreposición */}
              <div className={styles.donutCentroHtml} aria-hidden="true">
                <span className={styles.donutNumero}>{metricasVehiculos.total}</span>
                <span className={styles.donutSubtexto}>UNIDADES</span>
              </div>
            </div>

            {/* Leyenda y desglose accesible */}
            <div className={styles.leyendaDonut}>
              <div className={styles.itemLeyenda}>
                <span className={styles.itemLeyendaEtiqueta}>
                  <span className={styles.indicadorColor} style={{ backgroundColor: '#22c55e' }} />
                  Operativos
                </span>
                <span className={styles.itemLeyendaValor}>
                  {metricasVehiculos.operativos} {metricasVehiculos.operativos === 1 ? 'unidad' : 'unidades'} ({metricasVehiculos.pctOperativos}%)
                </span>
              </div>
              <div className={styles.itemLeyenda}>
                <span className={styles.itemLeyendaEtiqueta}>
                  <span className={styles.indicadorColor} style={{ backgroundColor: '#f59e0b' }} />
                  En Mantenimiento
                </span>
                <span className={styles.itemLeyendaValor}>
                  {metricasVehiculos.mantenimiento} {metricasVehiculos.mantenimiento === 1 ? 'unidad' : 'unidades'} ({metricasVehiculos.pctMantenimiento}%)
                </span>
              </div>
              <div className={styles.itemLeyenda}>
                <span className={styles.itemLeyendaEtiqueta}>
                  <span className={styles.indicadorColor} style={{ backgroundColor: '#ef4444' }} />
                  Fuera de Servicio
                </span>
                <span className={styles.itemLeyendaValor}>
                  {metricasVehiculos.fueraServicio} {metricasVehiculos.fueraServicio === 1 ? 'unidad' : 'unidades'} ({metricasVehiculos.pctFueraServicio}%)
                </span>
              </div>
            </div>

            {/* Tabla alternativa para lectores de pantalla */}
            <table className="sr-only">
              <caption>Distribución de estado vehicular</caption>
              <thead>
                <tr>
                  <th scope="col">Estado</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Porcentaje</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Operativos</td><td>{metricasVehiculos.operativos}</td><td>{metricasVehiculos.pctOperativos}%</td></tr>
                <tr><td>En Mantenimiento</td><td>{metricasVehiculos.mantenimiento}</td><td>{metricasVehiculos.pctMantenimiento}%</td></tr>
                <tr><td>Fuera de Servicio</td><td>{metricasVehiculos.fueraServicio}</td><td>{metricasVehiculos.pctFueraServicio}%</td></tr>
              </tbody>
            </table>
          </figure>
        </article>

        {/* Gráfico 2: Distribución por Marca */}
        <article className={styles.graficoCard}>
          <div className={styles.graficoEncabezado}>
            <h2 className={styles.graficoTitulo}>Marcas de Vehículos</h2>
            <span className={styles.graficoSubtitulo}>Top fabricantes en flota</span>
          </div>

          <div className={styles.listaBarras}>
            {metricasVehiculos.marcasOrdenadas.length === 0 ? (
              <p className={styles.subtitulo}>No hay vehículos registrados para clasificar.</p>
            ) : (
              metricasVehiculos.marcasOrdenadas.map((item) => (
                <div key={item.marca} className={styles.itemBarra}>
                  <div className={styles.infoBarra}>
                    <span>{item.marca}</span>
                    <span className={styles.conteobarrita}>
                      {item.cantidad} {item.cantidad === 1 ? 'unidad' : 'unidades'} ({item.porcentaje}%)
                    </span>
                  </div>
                  <div className={styles.pistaBarra}>
                    <div
                      className={styles.rellenoBarra}
                      style={{ width: `${Math.max(8, item.porcentaje)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Gráfico 3: Clasificación de Bitácoras según Prioridad */}
        <article className={styles.graficoCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.graficoEncabezado}>
            <h2 className={styles.graficoTitulo}>Clasificación de Bitácoras según Prioridad</h2>
            <span className={styles.graficoSubtitulo}>
              Total {metricasBitacoras.total} reportes registrados ({metricasBitacoras.pendientes} pendientes)
            </span>
          </div>

          <div className={styles.gridPrioridades}>
            <div className={styles.tarjetaPrioridad}>
              <div className={styles.metaPrioridad}>
                <span className={`${styles.badgePill} ${styles.prioridadCritica}`}>Crítica</span>
                <span>Fallas críticas que impiden la circulación inmediata</span>
              </div>
              <strong>{metricasBitacoras.critica} ({metricasBitacoras.pctCritica}%)</strong>
            </div>

            <div className={styles.tarjetaPrioridad}>
              <div className={styles.metaPrioridad}>
                <span className={`${styles.badgePill} ${styles.prioridadAlta}`}>Alta</span>
                <span>Averías mecánicas que requieren intervención urgente</span>
              </div>
              <strong>{metricasBitacoras.alta} ({metricasBitacoras.pctAlta}%)</strong>
            </div>

            <div className={styles.tarjetaPrioridad}>
              <div className={styles.metaPrioridad}>
                <span className={`${styles.badgePill} ${styles.prioridadMedia}`}>Media</span>
                <span>Desgaste o ruidos anormales para revisión programada</span>
              </div>
              <strong>{metricasBitacoras.media} ({metricasBitacoras.pctMedia}%)</strong>
            </div>

            <div className={styles.tarjetaPrioridad}>
              <div className={styles.metaPrioridad}>
                <span className={`${styles.badgePill} ${styles.prioridadBaja}`}>Baja</span>
                <span>Detalles estéticos o mantenimiento preventivo menor</span>
              </div>
              <strong>{metricasBitacoras.baja} ({metricasBitacoras.pctBaja}%)</strong>
            </div>
          </div>
        </article>
      </section>

      {/* Accesos Rápidos del Sistema */}
      <section aria-label="Accesos directos" className={styles.seccionAcciones}>
        <h2 className={styles.graficoTitulo}>Accesos Rápidos de Operación</h2>
        <div className={styles.accionesBotones}>
          {rol === 'Admin' && (
            <>
              <Link to="/vehiculos" className={`${styles.btnAccion} ${styles.btnAccionPrimario}`}>
                Gestionar Vehículos
              </Link>
              <Link to="/vehiculos/nuevo" className={`${styles.btnAccion} ${styles.btnAccionSecundario}`}>
                Registrar Nuevo Vehículo
              </Link>
            </>
          )}
          {rol === 'Mecanico' && (
            <Link to="/vehiculos" className={`${styles.btnAccion} ${styles.btnAccionPrimario}`}>
              Ver Flota de Vehículos
            </Link>
          )}
          <Link to="/bitacoras" className={`${styles.btnAccion} ${styles.btnAccionPrimario}`}>
            Ver Bitácoras de Fallas
          </Link>
          {(rol === 'Admin' || rol === 'Conductor') && (
            <Link to="/bitacoras/nueva" className={`${styles.btnAccion} ${styles.btnAccionSecundario}`}>
              Reportar Nueva Incidencia
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
