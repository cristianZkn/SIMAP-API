/**
 * VehiculoFormPage.tsx — Formulario de alta y edición de vehículos.
 */
import { useParams } from 'react-router-dom'

export function VehiculoFormPage() {
  const { id } = useParams<{ id?: string }>()
  const esEdicion = Boolean(id)

  return (
    <section aria-labelledby="titulo-formulario-vehiculo">
      <h1 id="titulo-formulario-vehiculo">
        {esEdicion ? `Editar Vehículo #${id}` : 'Registrar Nuevo Vehículo'}
      </h1>
      <p>Formulario de datos técnicos de la unidad.</p>
    </section>
  )
}
