/**
 * ConfirmDialog.tsx — Diálogo modal accesible para confirmación de acciones destructivas (WCAG 2.2).
 */
import { useEffect, useRef } from 'react'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: string
  textoConfirmar?: string
  textoCancelar?: string
  cargando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  textoCancelar = 'Cancelar',
  cargando = false,
  onConfirmar,
  onCancelar,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const botonCancelarRef = useRef<HTMLButtonElement | null>(null)
  const elementoPrevioRef = useRef<HTMLElement | null>(null)

  // Guardar elemento enfocado antes de abrir y restaurarlo al cerrar
  useEffect(() => {
    if (abierto) {
      elementoPrevioRef.current = document.activeElement as HTMLElement
      botonCancelarRef.current?.focus()
    } else if (elementoPrevioRef.current) {
      elementoPrevioRef.current.focus()
    }
  }, [abierto])

  // Cerrar al presionar Escape y atrapar el foco dentro del dialogo modal (WCAG 2.2)
  useEffect(() => {
    if (!abierto) return

    function manejarKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !cargando) {
        onCancelar()
        return
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const elementosEnfocables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (elementosEnfocables.length === 0) return

        const primerElemento = elementosEnfocables[0]
        const ultimoElemento = elementosEnfocables[elementosEnfocables.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === primerElemento) {
            e.preventDefault()
            ultimoElemento.focus()
          }
        } else {
          if (document.activeElement === ultimoElemento) {
            e.preventDefault()
            primerElemento.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', manejarKeyDown)
    return () => window.removeEventListener('keydown', manejarKeyDown)
  }, [abierto, cargando, onCancelar])

  if (!abierto) return null

  return (
    <div className={styles.backdrop}>
      <button
        type="button"
        className={styles.backdropOverlay}
        aria-label="Cerrar modal de confirmación"
        onClick={() => !cargando && onCancelar()}
        tabIndex={-1}
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-titulo"
        aria-describedby="dialog-descripcion"
        className={styles.dialog}
      >
        <h2 id="dialog-titulo" className={styles.titulo}>
          {titulo}
        </h2>
        <p id="dialog-descripcion" className={styles.descripcion}>
          {mensaje}
        </p>

        <div className={styles.acciones}>
          <button
            ref={botonCancelarRef}
            type="button"
            className={styles.btnCancelar}
            onClick={onCancelar}
            disabled={cargando}
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            className={styles.btnConfirmarPeligro}
            onClick={onConfirmar}
            disabled={cargando}
            aria-busy={cargando}
          >
            {cargando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
