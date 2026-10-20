/**
 * Spinner.tsx — Indicador visual y accesible de carga.
 */
import styles from './Spinner.module.css'

interface SpinnerProps {
  mensaje?: string
}

export function Spinner({ mensaje = 'Cargando datos...' }: SpinnerProps) {
  return (
    <output className={styles.spinnerWrapper} aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <span className={styles.text}>{mensaje}</span>
    </output>
  )
}
