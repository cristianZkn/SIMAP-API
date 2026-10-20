import { useState, type FormEvent } from 'react'
import { useCatalogos } from '../../shared/catalogosContext'
import styles from './ConfiguracionCatalogos.module.css'

export function ConfiguracionCatalogosPage() {
  const {
    prioridades,
    estadosFalla,
    estadosVehiculo,
    agregarPrioridad,
    eliminarPrioridad,
    agregarEstadoFalla,
    eliminarEstadoFalla,
    agregarEstadoVehiculo,
    eliminarEstadoVehiculo,
    restablecerPredeterminados,
  } = useCatalogos()

  const [nuevaPrioridad, setNuevaPrioridad] = useState('')
  const [nuevoEstadoFalla, setNuevoEstadoFalla] = useState('')
  const [nuevoEstadoVehiculo, setNuevoEstadoVehiculo] = useState('')

  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'exito' | 'error' } | null>(null)

  const notificar = (texto: string, tipo: 'exito' | 'error') => {
    setMensaje({ texto, tipo })
    setTimeout(() => {
      setMensaje((actual) => (actual?.texto === texto ? null : actual))
    }, 4000)
  }

  const handleAgregarPrioridad = (e: FormEvent) => {
    e.preventDefault()
    if (!nuevaPrioridad.trim()) return
    const ok = agregarPrioridad(nuevaPrioridad)
    if (ok) {
      notificar(`Nivel de prioridad "${nuevaPrioridad.trim()}" agregado exitosamente.`, 'exito')
      setNuevaPrioridad('')
    } else {
      notificar(`La prioridad "${nuevaPrioridad.trim()}" ya existe o no es válida.`, 'error')
    }
  }

  const handleEliminarPrioridad = (nombre: string) => {
    if (prioridades.length <= 1) {
      notificar('Debe haber al menos un nivel de prioridad en el sistema.', 'error')
      return
    }
    const ok = eliminarPrioridad(nombre)
    if (ok) {
      notificar(`Nivel de prioridad "${nombre}" eliminado del catálogo.`, 'exito')
    }
  }

  const handleAgregarEstadoFalla = (e: FormEvent) => {
    e.preventDefault()
    if (!nuevoEstadoFalla.trim()) return
    const ok = agregarEstadoFalla(nuevoEstadoFalla)
    if (ok) {
      notificar(`Estado de falla "${nuevoEstadoFalla.trim()}" agregado exitosamente.`, 'exito')
      setNuevoEstadoFalla('')
    } else {
      notificar(`El estado de falla "${nuevoEstadoFalla.trim()}" ya existe o no es válido.`, 'error')
    }
  }

  const handleEliminarEstadoFalla = (nombre: string) => {
    if (estadosFalla.length <= 1) {
      notificar('Debe haber al menos un estado de reporte en el sistema.', 'error')
      return
    }
    const ok = eliminarEstadoFalla(nombre)
    if (ok) {
      notificar(`Estado de falla "${nombre}" eliminado del catálogo.`, 'exito')
    }
  }

  const handleAgregarEstadoVehiculo = (e: FormEvent) => {
    e.preventDefault()
    if (!nuevoEstadoVehiculo.trim()) return
    const ok = agregarEstadoVehiculo(nuevoEstadoVehiculo)
    if (ok) {
      notificar(`Estado de vehículo "${nuevoEstadoVehiculo.trim()}" agregado exitosamente.`, 'exito')
      setNuevoEstadoVehiculo('')
    } else {
      notificar(`El estado de vehículo "${nuevoEstadoVehiculo.trim()}" ya existe o no es válido.`, 'error')
    }
  }

  const handleEliminarEstadoVehiculo = (nombre: string) => {
    if (estadosVehiculo.length <= 1) {
      notificar('Debe haber al menos un estado vehicular en el sistema.', 'error')
      return
    }
    const ok = eliminarEstadoVehiculo(nombre)
    if (ok) {
      notificar(`Estado vehicular "${nombre}" eliminado del catálogo.`, 'exito')
    }
  }

  const handleRestablecer = () => {
    restablecerPredeterminados()
    notificar('Se han restablecido los catálogos a sus valores predeterminados de fábrica.', 'exito')
  }

  return (
    <div className={styles.contenedor}>
      <header className={styles.encabezado}>
        <h1 className={styles.titulo}>Configuración de Estados y Prioridades</h1>
        <p className={styles.subtitulo}>
          Administre las prioridades de bitácoras, estados de fallas e incidencias mecánicas, y estados operativos de la flota vehicular. Las modificaciones se sincronizan automáticamente en los formularios de registro y filtros del sistema.
        </p>
      </header>

      {/* Región de anuncios accesibles para lectores de pantalla */}
      {mensaje && (
        <div
          role={mensaje.tipo === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={mensaje.tipo === 'error' ? styles.alertaError : styles.alertaExito}
        >
          {mensaje.texto}
        </div>
      )}

      <div className={styles.gridCatalogos}>
        {/* Catálogo 1: Niveles de Prioridad */}
        <section className={styles.tarjetaCatalogo} aria-labelledby="titulo-prioridades">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-prioridades" className={styles.seccionTitulo}>
              Prioridades de Falla
            </h2>
            <span className={styles.contadorBadge}>{prioridades.length} activas</span>
          </div>
          <p className={styles.seccionDescripcion}>
            Define los niveles de urgencia y gravedad (ej: baja, media, alta, crítica, urgente) para las incidencias de flota.
          </p>

          <form onSubmit={handleAgregarPrioridad} className={styles.formularioAgregar}>
            <label htmlFor="input-nueva-prioridad" className="sr-only">
              Nombre de nueva prioridad
            </label>
            <input
              id="input-nueva-prioridad"
              type="text"
              placeholder="Ej: Urgente, Bloqueante..."
              value={nuevaPrioridad}
              onChange={(e) => setNuevaPrioridad(e.target.value)}
              className={styles.inputTexto}
            />
            <button type="submit" className={styles.btnAgregar}>
              Añadir
            </button>
          </form>

          <ul className={styles.listaItems} aria-label="Lista de prioridades de fallas">
            {prioridades.map((p) => (
              <li key={p} className={styles.itemFila}>
                <span className={styles.itemEtiqueta}>{p}</span>
                <button
                  type="button"
                  onClick={() => handleEliminarPrioridad(p)}
                  className={styles.btnEliminar}
                  aria-label={`Eliminar prioridad ${p}`}
                  disabled={prioridades.length <= 1}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Catálogo 2: Estados de Reportes de Fallas */}
        <section className={styles.tarjetaCatalogo} aria-labelledby="titulo-estados-falla">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-estados-falla" className={styles.seccionTitulo}>
              Estados de Bitácoras
            </h2>
            <span className={styles.contadorBadge}>{estadosFalla.length} activos</span>
          </div>
          <p className={styles.seccionDescripcion}>
            Define el flujo de resolución operativa de fallas (ej: pendiente, en revisión, resuelta, en espera de repuesto).
          </p>

          <form onSubmit={handleAgregarEstadoFalla} className={styles.formularioAgregar}>
            <label htmlFor="input-nuevo-estado-falla" className="sr-only">
              Nombre de nuevo estado de falla
            </label>
            <input
              id="input-nuevo-estado-falla"
              type="text"
              placeholder="Ej: En espera de repuesto..."
              value={nuevoEstadoFalla}
              onChange={(e) => setNuevoEstadoFalla(e.target.value)}
              className={styles.inputTexto}
            />
            <button type="submit" className={styles.btnAgregar}>
              Añadir
            </button>
          </form>

          <ul className={styles.listaItems} aria-label="Lista de estados de fallas">
            {estadosFalla.map((est) => (
              <li key={est} className={styles.itemFila}>
                <span className={styles.itemEtiqueta}>{est}</span>
                <button
                  type="button"
                  onClick={() => handleEliminarEstadoFalla(est)}
                  className={styles.btnEliminar}
                  aria-label={`Eliminar estado de falla ${est}`}
                  disabled={estadosFalla.length <= 1}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* Catálogo 3: Estados de Flota Vehicular */}
        <section className={styles.tarjetaCatalogo} aria-labelledby="titulo-estados-vehiculo">
          <div className={styles.seccionHeader}>
            <h2 id="titulo-estados-vehiculo" className={styles.seccionTitulo}>
              Estados de Flota
            </h2>
            <span className={styles.contadorBadge}>{estadosVehiculo.length} activos</span>
          </div>
          <p className={styles.seccionDescripcion}>
            Define la disponibilidad operativa de cada vehículo (ej: Operativo, En mantenimiento, Fuera de servicio, En ruta).
          </p>

          <form onSubmit={handleAgregarEstadoVehiculo} className={styles.formularioAgregar}>
            <label htmlFor="input-nuevo-estado-vehiculo" className="sr-only">
              Nombre de nuevo estado vehicular
            </label>
            <input
              id="input-nuevo-estado-vehiculo"
              type="text"
              placeholder="Ej: En ruta, Dado de baja..."
              value={nuevoEstadoVehiculo}
              onChange={(e) => setNuevoEstadoVehiculo(e.target.value)}
              className={styles.inputTexto}
            />
            <button type="submit" className={styles.btnAgregar}>
              Añadir
            </button>
          </form>

          <ul className={styles.listaItems} aria-label="Lista de estados de vehículos">
            {estadosVehiculo.map((est) => (
              <li key={est} className={styles.itemFila}>
                <span className={styles.itemEtiqueta}>{est}</span>
                <button
                  type="button"
                  onClick={() => handleEliminarEstadoVehiculo(est)}
                  className={styles.btnEliminar}
                  aria-label={`Eliminar estado vehicular ${est}`}
                  disabled={estadosVehiculo.length <= 1}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className={styles.seccionRestablecer}>
        <p className={styles.textoRestablecer}>
          ¿Desea volver a la configuración estándar inicial? Esta acción restaura las prioridades y estados predeterminados recomendados por el sistema.
        </p>
        <button type="button" onClick={handleRestablecer} className={styles.btnRestablecer}>
          Restablecer Valores Predeterminados
        </button>
      </footer>
    </div>
  )
}
