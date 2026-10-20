/**
 * Layout.tsx — Componente estructural y envoltorio común de la aplicación.
 * 
 * Accesibilidad (WCAG 2.2 AA):
 * - Landmarks semánticos: <header>, <nav>, <main id="contenido-principal">, <footer>.
 * - Enlace Skip-link salta directo al <main> para navegación con teclado.
 * - Estados visuales y aria-current="page" en enlaces de navegación activos.
 * - Objetivos táctiles mínimos de 44x44px.
 * - Limpieza de caché de TanStack Query y sesión en el logout.
 */
import { useRef, useEffect } from 'react'
import { NavLink, Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../features/auth/AuthContext'
import styles from './Layout.module.css'

const ANIO_ACTUAL = new Date().getFullYear()

export function Layout() {
  const { usuario, rol, logout } = useAuth()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef<HTMLElement | null>(null)

  // Gestion de foco al cambiar de ruta para usuarios de lectores de pantalla (WCAG 2.2)
  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus()
  }, [location.pathname])

  const handleLogout = () => {
    // 1. Limpia la sesión del AuthContext y sessionStorage
    logout()
    // 2. Invalida y vacía la caché de TanStack Query para evitar filtración de datos entre sesiones
    queryClient.clear()
    // 3. Redirige a la pantalla de login
    navigate('/login', { replace: true })
  }

  // Comprobación de roles permitidos para navegación
  const puedeVerVehiculos = rol === 'Admin' || rol === 'Mecanico'
  const puedeVerBitacoras = rol === 'Admin' || rol === 'Mecanico' || rol === 'Conductor'

  return (
    <div className={styles.layout}>
      {/* Header y Navegación Principal */}
      <header className={styles.header}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.brand} aria-label="SIMAP — Inicio">
            <span>SIMAP</span>
            <span className={styles.brandBadge}>Flota</span>
          </Link>

          <nav aria-label="Navegación principal">
            <ul className={styles.navLinks}>
              <li>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                  }
                >
                  Inicio
                </NavLink>
              </li>
              {puedeVerVehiculos && (
                <li>
                  <NavLink
                    to="/vehiculos"
                    className={({ isActive }) =>
                      isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                    }
                  >
                    Vehículos
                  </NavLink>
                </li>
              )}
              {puedeVerBitacoras && (
                <li>
                  <NavLink
                    to="/bitacoras"
                    className={({ isActive }) =>
                      isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                    }
                  >
                    Bitácoras de Fallas
                  </NavLink>
                </li>
              )}
              {rol === 'Admin' && (
                <li>
                  <NavLink
                    to="/configuracion"
                    className={({ isActive }) =>
                      isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                    }
                  >
                    Configuración
                  </NavLink>
                </li>
              )}
            </ul>
          </nav>

          {/* Información del usuario autenticado y acción de salida */}
          <div className={styles.userArea}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{usuario?.nombre ?? 'Usuario'}</span>
              <span className={styles.roleBadge} title={`Rol del usuario: ${rol ?? 'Sin rol'}`}>
                {rol ?? 'Sin rol'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutBtn}
              aria-label="Cerrar sesión actual"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido dinámico renderizado por React Router */}
      <main ref={mainRef} id="contenido-principal" className={styles.mainContent} tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer accesible */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <p>© {ANIO_ACTUAL} SIMAP — Sistema de Mantenimiento Preventivo.</p>
          <p>UT2: Lenguaje de Programación Web II</p>
        </div>
      </footer>
    </div>
  )
}
