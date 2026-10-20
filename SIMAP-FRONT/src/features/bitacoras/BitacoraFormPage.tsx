/**
 * BitacoraFormPage.tsx — Formulario para reportar o actualizar una falla.
 */
import { useParams } from 'react-router-dom'

export function BitacoraFormPage() {
  const { id } = useParams<{ id?: string }>()
  const esEdicion = Boolean(id)

  return (
    <section aria-labelledby="titulo-formulario-bitacora">
      <h1 id="titulo-formulario-bitacora">
        {esEdicion ? `Actualizar Falla #${id}` : 'Reportar Nueva Falla'}
      </h1>
      <p>Registro de incidencia mecánica sobre un vehículo del parque automotor.</p>
    </section>
  )
}
