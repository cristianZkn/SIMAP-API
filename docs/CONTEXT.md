# CONTEXT — Contexto y Estado del Proyecto para Agentes

> Este archivo sirve como memoria persistente del estado del proyecto para cualquier agente de IA o desarrollador que retome el trabajo.

---

## 📌 Proyecto y Objetivo General
- **Asignatura:** Lenguaje de Programación Web II — UT2
- **Trabajo 2:** Frontend React + TypeScript, consumo de API RESTful y seguridad integral (cliente y servidor).
- **Backend:** C# / .NET 10 Minimal APIs con Entity Framework Core (`SIMAP/`), LocalDB SQL Server en `http://localhost:5288`.
- **Frontend:** React 19 + TypeScript + Vite (`SIMAP-FRONT/`) en `http://localhost:5173`.
- **Caso de negocio:** **SIMAP** (Sistema de Mantenimiento Preventivo).
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
| **Fase 3** | Autenticación JWT completa, manejo de sesión en sessionStorage, guards y logout | ✅ **Completada** | Flujo de sesión completo, login/registro, token exp check |
| **Fase 4.1** | CRUD de Vehículos (recurso principal): Listado, filtros URL, paginación, modal, form | ✅ **Completada** | `src/features/vehiculos/` |
| **Fase 4.2** | CRUD de Bitácoras (recurso relacionado): Listado, filtros y selección de vehículo | ✅ **Completada** | `src/features/bitacoras/` |
| **Fase 5** | Accesibilidad (WCAG 2.2 AA) y diseño responsivo mobile-first | ✅ **Completada** | [`docs/evidence/a11y/MANUAL_CHECKLIST.md`](file:///b:/proyectos/SIMAP/docs/evidence/a11y/MANUAL_CHECKLIST.md) y [`responsive/`](file:///b:/proyectos/SIMAP/docs/evidence/responsive/RESPONSIVE_EVIDENCE.md) |
| **Fase 6** | Pruebas de componentes (Vitest+MSW) y E2E (Playwright) | ✅ **Completada** | [`docs/evidence/tests/TEST_EVIDENCE.md`](file:///b:/proyectos/SIMAP/docs/evidence/tests/TEST_EVIDENCE.md) |
| **Fase 7** | Seguridad integral: mitigaciones OWASP y scripts de evidencia | ✅ **Completada** | [`docs/evidence/security/OWASP_MATRIX.md`](file:///b:/proyectos/SIMAP/docs/evidence/security/OWASP_MATRIX.md) y [`SECURITY_CHECKS_OUTPUT.md`](file:///b:/proyectos/SIMAP/docs/evidence/security/SECURITY_CHECKS_OUTPUT.md) |
| **Fase 8** | Documentación final (`INFORME_TECNICO.md`, `DEMO_GUIDE.md`, README) | ✅ **Completada** | [`docs/INFORME_TECNICO.md`](file:///b:/proyectos/SIMAP/docs/INFORME_TECNICO.md) y [`docs/DEMO_GUIDE.md`](file:///b:/proyectos/SIMAP/docs/DEMO_GUIDE.md) |

---

## 🛠️ Resumen de las Fases Completadas

### Fase 1 — Andamiaje Frontend
- Tipado de Vite (`src/vite-env.d.ts`) agregado.
- Todos los errores de `@[current_problems]` resueltos.
- `src/app/Layout.tsx` y `Layout.module.css` creados con navegación por roles y landmarks WCAG.
- Páginas de error 404 (`NotFoundPage`) y 403 (`ForbiddenPage`) creadas.
- Vistas base de `Vehiculos` y `Bitacoras` enlazadas en `App.tsx`.
- `npx tsc --noEmit` y `npm run build` ejecutados exitosamente con 0 errores.

### Fase 3 — Autenticación JWT, Roles y Registro
- Validación de expiración de JWT en cliente (`isTokenExpired`) al cargar desde `sessionStorage`.
- Manejo refinado de 401 en `httpClient.ts`: muestra mensaje de credenciales inválidas en el login sin recarga abrupta de página, y redirige a `/login?retorno=...` en rutas protegidas.
- Creación de vista de registro accesible [RegisterPage.tsx](file:///b:/proyectos/SIMAP/SIMAP-FRONT/src/features/auth/RegisterPage.tsx) para crear cuentas con roles (`Admin`, `Mecanico`, `Conductor`) conectada a `POST /auth/registro`.
- Enrutamiento público `/registro` añadido en [App.tsx](file:///b:/proyectos/SIMAP/SIMAP-FRONT/src/App.tsx).

### Fase 4.1 — CRUD Recurso Principal (Vehículos)
- Creación de componentes compartidos accesibles: `Spinner.tsx` y `ConfirmDialog.tsx` (diálogo modal accesible WCAG 2.2 con trampa de foco y cierre por tecla Escape).
- `VehiculosListPage.tsx`: TanStack Query `useQuery`, filtros reactivos sincronizados en URL con `useSearchParams` (búsqueda y estado), paginación cliente, tabla responsive con vista en tarjetas en móviles, eliminación con modal de confirmación y feedback accesible `aria-live`.
- `VehiculoFormPage.tsx`: Modo dual creación y edición, carga de datos existentes con TanStack Query, formulario accesible con React Hook Form y validación Zod (`placa`, `marca`, `modelo`, `anio`, `kilometraje`, `estado`), prevención de doble envío.
- Cumplimiento de regla de estilo: Prohibido el uso de emojis en código, comentarios y UI.

### Fase 4.2 — CRUD Recurso Relacionado (Bitácoras de Fallas)
- `BitacorasListPage.tsx`: Listado con TanStack Query, filtros URL de búsqueda, prioridad y estado (`useSearchParams`), paginación en cliente, visualización de placa y marca del vehículo asociado, y eliminación segura con `ConfirmDialog`.
- `BitacoraFormPage.tsx`: Formulario con selector `<select>` de vehículos cargado dinámicamente desde la API, React Hook Form y validación Zod (`vehiculoId`, `descripcion`, `prioridad`, `estadoFalla`). Modo dual de creación y edición.
- Backend: Configuración de permisos RBAC para permitir lectura de catálogo de vehículos a Conductores mientras se restringe la creación/modificación/eliminación exclusivamente a Admin y Mecánico. Inclusión de navegación `Vehiculo` en endpoints de bitácoras.

### Fase 5 — Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo
- Contraste de colores elevado y validado para texto normal (>= 4.5:1), texto secundario (7.0:1) y componentes interactivos/foco (>= 3:1).
- Definición de clase de utilidad accesible `.sr-only` para lectores de pantalla.
- Implementación de trampa completa de foco con ciclado de teclado (`Tab` / `Shift+Tab`) y escape seguro (`Escape`) en `ConfirmDialog.tsx`.
- Envoltura semántica accesible de tablas con `<section aria-label="...">`.
- Inclusión del atributo `aria-required="true"` en todos los campos obligatorios de login, registro, vehículos y bitácoras.
- Objetivos táctiles mínimos de 44x44px garantizados en todos los botones y enlaces interactivos.
- Adaptabilidad mobile-first con verificación y cero scroll horizontal desde 320px hasta 1440px.
- Documentación de pruebas y protocolo manual en [`docs/evidence/a11y/MANUAL_CHECKLIST.md`](file:///b:/proyectos/SIMAP/docs/evidence/a11y/MANUAL_CHECKLIST.md) y [`docs/evidence/responsive/RESPONSIVE_EVIDENCE.md`](file:///b:/proyectos/SIMAP/docs/evidence/responsive/RESPONSIVE_EVIDENCE.md).
- Linter (`oxlint` con `jsx-a11y`) y compilación de TypeScript limpios con 0 errores y 0 advertencias.

### Fase 6 — Pruebas Automatizadas (Unitarias, Integración y E2E)
- Configuración de Vitest + React Testing Library + Mock Service Worker (MSW 3) + Playwright (Chromium).
- Suites unitarias y de integración:
  - `LoginPage.test.tsx`: validación síncrona Zod, manejo de 401 y persistencia de sesión.
  - `Guards.test.tsx`: `ProtectedRoute` y `RoleGuard` probados con tokens JWT válidos y escenarios de rechazo.
  - `VehiculosCrud.test.tsx`: carga inicial, renderizado con datos mock de MSW, filtrado reactivo y manejo de error 500 con reintento.
  - Total unitarias/integración: 14 pruebas pasando al 100%.
- Cobertura de código (`npm run test:coverage`): 100% en componentes de autenticación y guards.
- Suites E2E con Playwright:
  - `guards.spec.ts`: redirección a `/login?retorno=...` sin sesión y redirección a `/403` para rol no autorizado.
  - `flujo-completo.spec.ts`: flujo completo Registro -> Login -> Navegación -> Alta de Vehículo -> Listado en tabla.
  - Total E2E: 3 pruebas pasando al 100%.
- Documentación y evidencia en [`docs/evidence/tests/TEST_EVIDENCE.md`](file:///b:/proyectos/SIMAP/docs/evidence/tests/TEST_EVIDENCE.md).

### Fase 7 — Seguridad Integral (OWASP API Top 10 y Scripts Automatizados)
- Elaboración de matriz exhaustiva de mitigaciones OWASP en [`docs/evidence/security/OWASP_MATRIX.md`](file:///b:/proyectos/SIMAP/docs/evidence/security/OWASP_MATRIX.md), cubriendo API1 (BOLA), API2 (Auth), API3 (Exposición de datos), API4 (Rate Limiting), API5 (RBAC), API7 (CORS), API8 (Configuración errónea) y A03 (Inyección/XSS).
- Justificación teórica y técnica de la elección de `sessionStorage` para el almacenamiento del token JWT (mitigación de persistencia indebida y reducción de superficie XSS en equipos compartidos frente a `localStorage`, prescindiendo de cookies de sesión sin estado en arquitecturas REST desacopladas).
- Creación y ejecución del script de auditoría en vivo `scripts/security-checks.mjs` (`npm run test:security` en `SIMAP-FRONT`).
- Validación de 11 controles de seguridad ejecutados contra la API real (`http://localhost:5288`): cabeceras HTTP (nosniff, DENY, referrer-policy, xss-protection), rechazo CORS de orígenes no autorizados y aceptación estricta de frontend, autenticación 401, RBAC 403 vs 201, mitigación de inyección XSS y rate limiting con respuesta HTTP 429 tras 100 peticiones.
- 100% de controles aprobados (11/11) documentados en [`docs/evidence/security/SECURITY_CHECKS_OUTPUT.md`](file:///b:/proyectos/SIMAP/docs/evidence/security/SECURITY_CHECKS_OUTPUT.md).

### Fase 8 — Documentación Final y Guía de Demostración
- Creación de [`docs/INFORME_TECNICO.md`](file:///b:/proyectos/SIMAP/docs/INFORME_TECNICO.md) consolidando el análisis exhaustivo de arquitectura, stack, contratos del backend, comparativa técnica y justificación de `sessionStorage`, matriz de seguridad OWASP y accesibilidad WCAG 2.2 AA.
- Creación de [`docs/DEMO_GUIDE.md`](file:///b:/proyectos/SIMAP/docs/DEMO_GUIDE.md) con el guion paso a paso para la defensa oral (5-10 minutos, 8 pasos de demostración) y banco de preguntas conceptuales frecuentes del docente con respuestas técnicas fundamentadas.
- Creación de [`README.md`](file:///b:/proyectos/SIMAP/README.md) en la raíz del repositorio con guía completa de instalación, ejecución de backend y frontend, credenciales de prueba por rol (`admin@simap.cl`, `mecanico@simap.cl`, `conductor@simap.cl`), comandos de pruebas y mapa documental de enlaces.
- Actualización completa de [`AI_LOG.md`](file:///b:/proyectos/SIMAP/AI_LOG.md) con el registro integral de herramientas, reflexiones de aprendizaje y métricas de calidad (100% de fases completadas).
- Cumplimiento de la regla de estilo: Prohibición total de emojis en código, comentarios, títulos y subtítulos.

### Fase 9 — Panel Principal Analítico (Dashboard), Tema Oscuro y Corrección de Tipografía
- Diseño e implementación de la vista principal analítica en [`src/features/dashboard/DashboardPage.tsx`](file:///b:/proyectos/SIMAP/SIMAP-FRONT/src/features/dashboard/DashboardPage.tsx) y [`Dashboard.module.css`](file:///b:/proyectos/SIMAP/SIMAP-FRONT/src/features/dashboard/Dashboard.module.css):
  - Gráfico 1: Estado operativo de vehículos (gráfico circular Donut SVG accesible con leyenda detallada).
  - Gráfico 2: Distribución de marcas de vehículos con barras horizontales de progreso.
  - Gráfico 3: Clasificación de bitácoras de fallas por nivel de prioridad (Crítica, Alta, Media, Baja).
  - Tarjetas de indicadores clave (KPIs) ejecutivas para flota vehicular, disponibilidad, vehículos en taller e incidencias activas.
  - Sección de accesos rápidos de operación según rol autenticado.
- Corrección de colisión y sobreposición de fuentes en el gráfico Donut: desacoplamiento del número y rótulo hacia un contenedor HTML absoluto centrado (`.donutCentroHtml`), eliminando colisiones de coordenadas SVG con rotación de texto.
- Corrección de ancho y quiebre de línea en la leyenda del gráfico Donut: reestructuración en disposición vertical con separador sutil y filas a ancho completo (`.itemLeyenda`), garantizando espacio holgado y legibilidad sin quiebres de texto.
- Implementación de un tema visual oscuro sobrio y de alta gama inspirado en la ingeniería del repositorio ECC:
  - Tokens globales en [`src/index.css`](file:///b:/proyectos/SIMAP/SIMAP-FRONT/src/index.css): fondo `--color-bg: #090d16`, tarjetas `--color-card: #0f172a`, bordes `--color-border: #1e293b`, textos `--color-text: #f8fafc` y `--color-text-muted: #94a3b8`.
  - Eliminación total de fondos blancos residuales (`#ffffff`) en tablas, filtros, modales, formularios y páginas de error.
  - Estandarización de badges semánticos translúcidos con contraste WCAG 2.2 AA.
- Estandarización de nomenclatura oficial: "SIMAP — Sistema de Mantenimiento Preventivo".

### Fase 10 — Ajuste Estricto de Roles y Permisos (RBAC Negocio: Mecánico y Conductor)
- **Resolución de problemas de roles según reglas de negocio:**
  - **Mecánico:** Puede visualizar la flota de vehículos y las bitácoras de fallas. No puede modificar vehículos (no tiene botones de crear, editar o eliminar vehículos, ni acceso a rutas `/vehiculos/nuevo` o `/vehiculos/:id/editar`). No puede eliminar bitácoras ni alterar la descripción o vehículo reportado; **únicamente puede modificar el estado de la falla** (`pendiente`, `en revisión`, `resuelta`), tanto de forma rápida desde la tabla como en el formulario de edición donde los demás campos están deshabilitados.
  - **Conductor:** Puede visualizar el panel de control y las bitácoras de fallas sin bloqueos 403. Puede reportar nuevas incidencias mecánicas (`/bitacoras/nueva`), seleccionando dinámicamente cualquier vehículo de la flota vía `GET /api/v1/vehiculos` y creando el reporte con `POST /api/v1/bitacoras`. No tiene acceso a la gestión de vehículos ni a la edición o eliminación de registros ajenos.
  - **Administrador:** Mantiene acceso total de creación, lectura, actualización y eliminación sobre todos los recursos del sistema.
- **Hardening en Backend (`VehiculoAPI.cs` y `BitacoraAPI.cs`):**
  - `POST /vehiculos`, `PUT /vehiculos/{id}`, `DELETE /vehiculos/{id}`: restringidos estrictamente a `RequireRole("Admin")`.
  - `GET /vehiculos`: permitido para `Admin`, `Mecanico` y `Conductor` (necesario para reporte de fallas y visualización).
  - `POST /bitacoras`: restringido a `RequireRole("Admin", "Conductor")`.
  - `PUT /bitacoras/{id}`: `RequireRole("Admin", "Mecanico")`. En el handler, si el usuario es `Mecanico`, el servidor fuerza la inmutabilidad de los campos descriptivos y actualiza **únicamente** `EstadoFalla`.
  - `DELETE /bitacoras/{id}`: restringido estrictamente a `RequireRole("Admin")`.
- **Validación automatizada:** Suite de pruebas E2E en [`e2e/roles-permisos.spec.ts`](file:///b:/proyectos/SIMAP/SIMAP-FRONT/e2e/roles-permisos.spec.ts) validando que el Conductor reporta fallas con vehículo asignado sin 403, y que el Mecánico visualiza sin botones de alteración vehicular ni de borrado. (5 de 5 pruebas Playwright aprobadas al 100%).



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
- **Estilo de código y UI:** Prohibido el uso de emojis en código fuente, comentarios, títulos, subtítulos o textos de la interfaz web (mantener diseño profesional y sobrio).
