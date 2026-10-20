# AGENT_CONTEXT — Contexto y Estado del Proyecto para Agentes

> Este archivo sirve como memoria persistente del estado del proyecto para cualquier agente de IA o desarrollador que retome el trabajo.

---

## 📌 Proyecto y Objetivo General
- **Asignatura:** Lenguaje de Programación Web II — UT2
- **Trabajo 2:** Frontend React + TypeScript, consumo de API RESTful y seguridad integral (cliente y servidor).
- **Backend:** C# / .NET 10 Minimal APIs con Entity Framework Core (`SIMAP/`), LocalDB SQL Server en `http://localhost:5288`.
- **Frontend:** React 19 + TypeScript + Vite (`SIMAP-FRONT/`) en `http://localhost:5173`.
- **Caso de negocio:** **SIMAP** (Sistema de Mantenimiento de Parque Automotor).
  - Recurso principal: `Vehiculo` (placa, marca, modelo, anio, kilometraje, estado).
  - Recursos relacionados: `BitacoraFalla` (reporte de fallas), `Mantenimiento` (orden de taller), `Usuario`, `Rol`.
  - Roles en el sistema: `Admin` (gestiona todo), `Mecanico` (vehículos, bitácoras, mantenimientos), `Conductor` (solo bitácoras).

---

## 🚦 Estado de las Fases del Plan de Trabajo

| Fase | Descripción | Estado | Documento de referencia / Salida |
|---|---|---|---|
| **Fase 0** | Descubrimiento del backend (inspección de contratos, fallas y roles) | ✅ **Completada** | [`docs/BACKEND_DISCOVERY.md`](file:///b:/proyectos/SIMAP/docs/BACKEND_DISCOVERY.md) |
| **Fase 2** | Hardening del backend (CORS, cabeceras OWASP, rate limit, DTOs sin passwordHash, pipeline) | ✅ **Completada** | [`docs/BACKEND_CHANGES.md`](file:///b:/proyectos/SIMAP/docs/BACKEND_CHANGES.md) |
| **Fase 1** | Andamiaje Vite+TS, ESLint/jsx-a11y, Prettier, router, `httpClient`, Layout accesible | ✅ **Completada** | `SIMAP-FRONT/` compila 100% limpia sin errores |
| **Fase 3** | Autenticación JWT completa, manejo de sesión en sessionStorage, guards y logout | 🟡 **SIGUIENTE FASE** | `src/features/auth/` |
| **Fase 4** | CRUD completo de recurso principal (`Vehiculos`) y relacionado (`Bitacoras`), Zod | ⏳ Pendiente | `src/features/vehiculos/`, `bitacoras/` |
| **Fase 5** | Accesibilidad (WCAG 2.2 AA) y diseño responsivo mobile-first | ⏳ Pendiente | `docs/evidence/a11y/`, `responsive/` |
| **Fase 6** | Pruebas de componentes (Vitest+MSW) y E2E (Playwright) | ⏳ Pendiente | `docs/evidence/tests/` |
| **Fase 7** | Seguridad integral: mitigaciones OWASP y scripts de evidencia | ⏳ Pendiente | `docs/evidence/security/` |
| **Fase 8** | Documentación final (`INFORME_TECNICO.md`, `DEMO_GUIDE.md`, README) | ⏳ Pendiente | `docs/INFORME_TECNICO.md` |

---

## 🛠️ Resumen de la Fase Completada (Fase 1: Andamiaje Frontend)
- Tipado de Vite (`src/vite-env.d.ts`) agregado.
- Todos los errores de `@[current_problems]` resueltos.
- `src/app/Layout.tsx` y `Layout.module.css` creados con navegación por roles y landmarks WCAG.
- Páginas de error 404 (`NotFoundPage`) y 403 (`ForbiddenPage`) creadas.
- Vistas base de `Vehiculos` y `Bitacoras` enlazadas en `App.tsx`.
- `npx tsc --noEmit` y `npm run build` ejecutados exitosamente con 0 errores.

### Sub-pasos de la Fase 1:
1. **Tipado Vite:** Crear `src/vite-env.d.ts` para resolver soporte de `import.meta.env`, CSS Modules y tipos de assets.
2. **Correcciones de TypeScript en auth:**
   - Crear `src/features/auth/LoginPage.module.css` con diseño responsive y accesible.
   - Eliminar `@ts-expect-error` innecesario en `LoginPage.tsx`.
3. **Páginas de Error y Layout Raíz:**
   - Crear `src/app/Layout.tsx` (Navbar con roles, skip link, landmark `<main id="contenido-principal">`, footer accesible).
   - Crear `src/pages/NotFoundPage.tsx` (404) y `src/pages/ForbiddenPage.tsx` (403).
4. **Vistas Base para Rutas del Router:**
   - Crear componentes base tipados para `VehiculosListPage`, `VehiculoFormPage`, `BitacorasListPage`, `BitacoraFormPage` para que el router de `App.tsx` resuelva todas las dependencias sin errores de compilación.
5. **Limpieza y Estándares:**
   - Eliminar archivos residuales de JavaScript (`App.jsx`, `main.jsx`, `vite.config.js`).
   - Configuración de ESLint + jsx-a11y y Prettier.
   - Comprobación de compilación limpia con `npx tsc --noEmit` y `npm run build`.

---

## 🔑 Parámetros y Convenciones Clave
- **Backend URL:** `http://localhost:5288/api/v1`
- **Frontend URL:** `http://localhost:5173`
- **Token JWT:** Almacenado en `sessionStorage` (`simap_token` y `simap_usuario`).
- **Política de pausas:** Pausa de revisión y commit al cerrar cada fase (o sub-fase extensa) para evitar cambios gigantescos de golpe.
