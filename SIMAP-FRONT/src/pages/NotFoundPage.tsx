/**
 * NotFoundPage.tsx — Página 404 para rutas inexistentes.
 */
import { Link, useNavigate } from 'react-router-dom'
import styles from './ErrorPage.module.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.description}>
          La ruta que intentas visitar no existe o ha sido movida. Por favor, verifica la dirección URL o regresa al inicio.
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={() => navigate(-1)} className={styles.btnSecondary}>
            Volver atrás
          </button>
          <Link to="/" className={styles.btnPrimary}>
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
