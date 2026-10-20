/**
 * ForbiddenPage.tsx — Página 403 para accesos denegados por falta de rol.
 * 
 * Cumple los criterios de seguridad OWASP API5 (Broken Function Level Authorization):
 * Informa con claridad que la cuenta no tiene los permisos suficientes para
 * la sección solicitada, sin revelar información sensible ni datos de endpoints.
 */
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import styles from './ErrorPage.module.css'

export function ForbiddenPage() {
  const { rol, usuario } = useAuth()
  const navigate = useNavigate()

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.code} ${styles.codeDanger}`}>403</div>
        <h1 className={styles.title}>Acceso restringido</h1>
        <p className={styles.description}>
          Hola <strong>{usuario?.nombre ?? 'Usuario'}</strong>, tu rol actual es <strong>{rol ?? 'Sin rol'}</strong>. No dispones de los privilegios necesarios para acceder a este recurso.
        </p>
        <div className={styles.actions}>
          <button type="button" onClick={() => navigate(-1)} className={styles.btnSecondary}>
            Volver atrás
          </button>
          <Link to="/" className={styles.btnPrimary}>
            Ir a mi panel
          </Link>
        </div>
      </div>
    </div>
  )
}
