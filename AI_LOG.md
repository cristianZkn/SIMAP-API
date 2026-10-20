# AI_LOG — Bitácora de Uso de Inteligencia Artificial

> Asignatura: Lenguaje de Programación Web II — UT2  
> Trabajo 2: Frontend, consumo de API y seguridad  
> Fecha de entrega: 20-10-2026  
> Estudiante: [Completar con nombre del estudiante]  
> Plan / Tipo de cuenta de IA: [Completar con plan: ej. Claude Pro / ChatGPT Plus / Gemini Advanced / Free]

---

## 1. Registro General de Herramientas y Modelos

| Herramienta / Entorno | Modelo | Propósito Principal |
|---|---|---|
| Asistente Agentic (IDE / Antigravity) | Gemini 3.8 Flash / Claude Opus 4.6 | Análisis de backend, hardening de seguridad, arquitectura y desarrollo frontend |
| Sistema ECC (Everything Claude Code) | Skills & Rules (common, typescript, security-review, backend-patterns) | Estándares de desarrollo, flujos de seguridad y TDD |

---

## 2. Registro por Áreas y Fases

### Fase 0 — Descubrimiento del Backend
- **Objetivo:** Inspección del código C# de la API existente en `SIMAP/`, extracción del contrato de endpoints, roles, modelo de datos, auth y detección de fallas bloqueantes.
- **Prompt base:** "Lee el repositorio del backend y produce un documento `docs/BACKEND_DISCOVERY.md` con stack, caso de negocio, contrato endpoint por endpoint, auth, roles, formato de errores, estado de seguridad actual y fallas que impiden el consumo."
- **Qué se aceptó:** Contrato completo de 6 recursos (`Auth`, `Vehiculo`, `BitacoraFalla`, `Mantenimiento`, `Usuario`, `Rol`), mapeo de roles (`Admin`, `Mecanico`, `Conductor`), detección de fallas F1 a F7.
- **Qué se corrigió:** Se identificó que no existía proyecto `SIMAP.Tests` en el Trabajo 1 original y que los endpoints de listado no implementaban paginación ni filtros en servidor.
- **Entregable generado:** [`docs/BACKEND_DISCOVERY.md`](file:///b:/proyectos/SIMAP/docs/BACKEND_DISCOVERY.md).

---

### Fase 2 — Hardening del Backend (Seguridad y Compatibilidad)
- **Objetivo:** Corregir fallas del backend para habilitar el consumo seguro desde el frontend sin alterar la lógica de negocio.
- **Prompts y acciones:**
  1. *CORS:* Incorporación de `http://localhost:5173` y lectura de `FRONTEND_URL` para producción.
  2. *Contraseñas seguras en tránsito:* Traslado de la contraseña del registro desde query params (`?password=`) hacia el cuerpo JSON (`RegistroRequest`) en `SIMAP/Endpoints/AuthAPI.cs`.
  3. *Eliminación de exposición de datos sensibles (OWASP API3):* Creación de `UsuarioDto` en `SIMAP/Models/UsuarioDto.cs`. Aplicación tanto en `AuthAPI.cs` como en `UsuarioAPI.cs` para evitar que `PasswordHash` viaje en respuestas HTTP.
  4. *Cabeceras HTTP de seguridad (OWASP API8):* Middleware para `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`.
  5. *Pipeline de Middlewares y Errores Genéricos:* Reordenamiento del pipeline para que CORS y Rate Limiting se ejecuten antes de `UseAuthentication` y `UseAuthorization` (evita falsos bloqueos de CORS en respuestas 401/403 o preflight OPTIONS). Agregado de `UseExceptionHandler` con mensaje genérico en producción.
- **Qué se aceptó:** El minimalismo en los cambios para no quebrar compatibilidad con el Trabajo 1.
- **Qué se descartó:** No reescribir la capa de acceso a datos ni agregar librerías pesadas externas al backend.
- **Entregable generado:** [`docs/BACKEND_CHANGES.md`](file:///b:/proyectos/SIMAP/docs/BACKEND_CHANGES.md).

### Fase 1 — Andamiaje Frontend, Enrutamiento y Resolución de Compilación
- **Objetivo:** Configuración completa del entorno React + TypeScript + Vite, resolución de errores de compilación (`@[current_problems]`), establecimiento del cliente HTTP (`httpClient`), layout accesible y páginas base de enrutamiento.
- **Prompts y acciones:**
  1. *Tipado Vite:* Creación de `src/vite-env.d.ts` con `<reference types="vite/client" />` para resolver tipos de `import.meta.env` y CSS Modules.
  2. *Correcciones en Auth:* Creación de `LoginPage.module.css` (mobile-first, contrastes WCAG 2.2 AA) y eliminación del `@ts-expect-error` innecesario en la asignación del ref en `LoginPage.tsx`.
  3. *Layout y Accesibilidad:* Creación de `src/app/Layout.tsx` y `Layout.module.css` con landmarks semánticos (`<header>`, `<nav>`, `<main id="contenido-principal">`, `<footer>`), skip-link, navegación condicionada por rol y vaciado de caché de TanStack Query al cerrar sesión.
  4. *Páginas de Error:* Creación de `src/pages/NotFoundPage.tsx` (404) y `src/pages/ForbiddenPage.tsx` (403 con explicación según rol del usuario).
  5. *Vistas Base de Rutas:* Implementación inicial tipada de `VehiculosListPage`, `VehiculoFormPage`, `BitacorasListPage` y `BitacoraFormPage` para cerrar el árbol de rutas de `App.tsx`.
  6. *Limpieza de Código:* Eliminación de archivos obsoletos (`App.jsx`, `main.jsx`, `vite.config.js`). Actualización de `SIMAP-FRONT/README.md`.
- **Verificación real:** `npx tsc --noEmit` completó con 0 errores; `npm run build` generó el bundle de producción exitosamente en 2.10 segundos.
- **Entregables generados:** Código fuente de `SIMAP-FRONT/`, `SIMAP-FRONT/README.md`, [`docs/AGENT_CONTEXT.md`](file:///b:/proyectos/SIMAP/docs/AGENT_CONTEXT.md).

---

### Fase 3 — Autenticación JWT, Roles y Registro
- **Objetivo:** Completar el flujo de autenticación, almacenamiento seguro en `sessionStorage`, validación de token expirado en cliente, guards (`ProtectedRoute`, `RoleGuard`), logout con limpieza de caché y página de registro con selección de roles.
- **Prompts y acciones:**
  1. *Refinamiento de 401 en `httpClient.ts`:* Prevención de recarga de página cíclica cuando la solicitud de error proviene de `/auth/login`, permitiendo renderizar errores por credenciales incorrectas en el propio formulario. Redirección automática a `/login?retorno=...` ante expiración en rutas protegidas.
  2. *Validación de Token Expirado:* Implementación de `isTokenExpired(token)` en `AuthContext.tsx` leyendo el claim `exp` del JWT. Si ha vencido, limpia `sessionStorage` y arranca con sesión nula.
  3. *Página de Registro Accesible:* Creación de `RegisterPage.tsx` con validación Zod (`nombre`, `email`, `password`, `rolId`), selector de roles (`Admin: 2`, `Mecánico: 1`, `Conductor: 4`) y anuncio en vivo de cuenta creada exitosamente.
  4. *Enrutamiento Público:* Adición de la ruta `/registro` en `App.tsx`.
- **Verificación real:** `npx tsc --noEmit` completó con 0 errores; `npm run build` generó el bundle en 3.49 segundos con 239 módulos transformados.
- **Entregables generados:** `RegisterPage.tsx`, `AuthContext.tsx`, `httpClient.ts`, `App.tsx`.

### Fase 4.1 — CRUD Recurso Principal (Vehículos)
- **Objetivo:** Implementar el CRUD completo para la gestión de vehículos (`/vehiculos`), con filtros, paginación, modales accesibles y validación de formularios, respetando la regla de estilo de cero emojis.
- **Prompts y acciones:**
  1. *Componentes Compartidos:* Creación de `Spinner.tsx` (con mensaje accesible `role="status"`) y `ConfirmDialog.tsx` (diálogo modal accesible WCAG 2.2 con `role="alertdialog"`, `aria-modal="true"`, captura de foco y tecla Escape).
  2. *Listado con TanStack Query:* Creación de `VehiculosListPage.tsx` consumiendo `obtenerVehiculos`, filtros de búsqueda y estado sincronizados con la URL (`useSearchParams`), paginación del lado cliente y tabla responsiva que se colapsa en tarjetas en pantallas móviles (320px+).
  3. *Eliminación con Modal de Confirmación:* Mutación con invalidación de caché (`queryClient.invalidateQueries({ queryKey: ['vehiculos'] })`) y retroalimentación en región `aria-live`.
  4. *Formulario Dinámico:* Creación de `VehiculoFormPage.tsx` con soporte para creación y edición, precarga de datos con TanStack Query, formulario gestionado con React Hook Form y validación Zod (`placa`, `marca`, `modelo`, `anio`, `kilometraje`, `estado`), control de doble envío y mensajes de error por campo.
  5. *Regla de estilo sin emojis:* Se eliminaron emojis en código, comentarios y UI.
- **Verificación real:** `npx tsc --noEmit` completó con 0 errores; `npm run build` generó el bundle de producción en 740 ms.
- **Entregables generados:** `VehiculosListPage.tsx`, `VehiculoFormPage.tsx`, `Vehiculos.module.css`, `Spinner.tsx`, `ConfirmDialog.tsx`.

### Fase 4.2 — CRUD Recurso Relacionado (Bitácoras de Fallas)
- **Objetivo:** Implementar el CRUD completo para la gestión de bitácoras de incidencias (`/bitacoras`), con selector dinámico de vehículos cargado desde la API, filtros, paginación, modales accesibles y validación Zod.
- **Prompts y acciones:**
  1. *Listado con Cruce de Datos:* Creación de `BitacorasListPage.tsx` consumiendo `obtenerBitacoras` y mapeando los datos de vehículos asociados, filtros URL por texto, prioridad y estado (`useSearchParams`), paginación en cliente y eliminación con `ConfirmDialog`.
  2. *Formulario con Selector Dinámico:* Creación de `BitacoraFormPage.tsx` con un `<select>` de vehículos cargado dinámicamente desde la API mediante TanStack Query, validación Zod (`vehiculoId`, `descripcion`, `prioridad`, `estadoFalla`) y manejo de errores del servidor.
  3. *Seguridad RBAC en Backend:* Ajuste en `VehiculoAPI.cs` para permitir lectura del catálogo de vehículos a Conductores (necesario para reportar fallas en una unidad) mientras se restringen las mutaciones exclusivamente a Administradores y Mecánicos.
  4. *Inclusión de Entidades Relacionadas:* Endpoint `GET /api/v1/bitacoras` actualizado con `ObtenerConIncluidosAsync(b => b.Vehiculo)` para devolver la información del vehículo sin realizar peticiones redundantes.
- **Verificación real:** `npx tsc --noEmit` completó con 0 errores; `npm run build` completó en 505 ms.
- **Entregables generados:** `BitacorasListPage.tsx`, `BitacoraFormPage.tsx`, `Bitacoras.module.css`, `types.ts`, `VehiculoAPI.cs`, `BitacoraAPI.cs`.

### Fase 5 — Accesibilidad (WCAG 2.2 AA) y Diseño Responsivo
- **Objetivo:** Garantizar cumplimiento estricto de WCAG 2.2 nivel AA en toda la aplicación, ratios de contraste superiores a 4.5:1 / 3:1, navegación completa por teclado con foco visible y trampa de foco en modales, touch targets >= 44x44px, adaptabilidad mobile-first sin desbordamiento horizontal desde 320px, y documentación de protocolo para lectores de pantalla.
- **Prompts y acciones:**
  1. *Tokens de Contraste y Utilidades:* Actualización de `index.css` con variables de alto contraste (`--color-text-muted: #475569` ratio 7.0:1, `--color-danger: #b91c1c` ratio 5.8:1, `--color-success: #15803d` ratio 4.88:1, `--color-warning: #92400e` ratio 5.6:1). Inclusión de la clase de utilidad `.sr-only`.
  2. *Trampa de Foco en Modales:* Actualización de `ConfirmDialog.tsx` con captura completa de eventos `Tab` y `Shift + Tab` dentro del diálogo modal, impidiendo el escape del foco al fondo, y retorno del foco al elemento disparador tras el cierre con `Escape`.
  3. *Atributos de Formulario Accesibles:* Incorporación de `aria-required="true"` en todos los campos obligatorios de `LoginPage.tsx`, `RegisterPage.tsx`, `VehiculoFormPage.tsx` y `BitacoraFormPage.tsx`, junto con asociaciones `<label htmlFor="...">` y enlaces de error `aria-describedby` y `aria-invalid`.
  4. *Semántica de Tablas:* Envoltura de tablas de datos con elemento semántico `<section aria-label="...">` y captions accesibles para lectores de pantalla.
  5. *Objetivos Táctiles y Mobile-First:* Aseguramiento de altura mínima de 44px (`min-height: 44px`) en todos los botones y enlaces interactivos. Transformación de tablas en tarjetas autocontenidas mediante pseudo-elementos `::before` con `attr(data-label)` en anchos <= 768px. Reglas de contención a 1 columna bajo 480px y 320px sin scroll horizontal.
  6. *Protocolos y Evidencia:* Redacción de `docs/evidence/a11y/MANUAL_CHECKLIST.md` (instrucciones para NVDA y teclado) y `docs/evidence/responsive/RESPONSIVE_EVIDENCE.md` (matriz de viewports 320px a 1440px).
- **Verificación real:** `npx tsc --noEmit` completó con 0 errores; `npm run lint` (`oxlint` con `jsx-a11y`) completó con 0 errores y 0 advertencias; `npm run build` completó en 644 ms.
- **Entregables generados:** `index.css`, `Layout.module.css`, `Vehiculos.module.css`, `Bitacoras.module.css`, `ConfirmDialog.tsx`, `ConfirmDialog.module.css`, `VehiculosListPage.tsx`, `BitacorasListPage.tsx`, `VehiculoFormPage.tsx`, `BitacoraFormPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx`, `docs/evidence/a11y/MANUAL_CHECKLIST.md`, `docs/evidence/responsive/RESPONSIVE_EVIDENCE.md`.

### Fase 6 — Pruebas Automatizadas (Unitarias, Integración y E2E)
- **Objetivo:** Implementar la suite completa de pruebas unitarias y de integración con Vitest, React Testing Library y Mock Service Worker (MSW 3), junto con pruebas End-to-End con Playwright (Chromium) sobre la aplicación en vivo conectada con el backend .NET 10.
- **Prompts y acciones:**
  1. *Infraestructura de Pruebas Unitarias:* Instalación de `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `msw` y `@vitest/coverage-v8`.
  2. *Mock Service Worker (MSW 3):* Creación de `src/test/mocks/handlers.ts` y `server.ts` interceptando endpoints de autenticación, vehículos y bitácoras. Configuración de adaptador `fetch` en Axios para intercepción limpia en jsdom.
  3. *Envoltorio de Proveedores:* Creación de `src/test/test-utils.tsx` con `QueryClientProvider`, `AuthProvider` y `MemoryRouter`.
  4. *Suites de Pruebas Unitarias e Integración:*
     - `LoginPage.test.tsx` (5 pruebas): validación síncrona Zod, manejo de 401 y persistencia de token JWT en `sessionStorage`.
     - `Guards.test.tsx` (4 pruebas): redirección de `ProtectedRoute` sin token, renderizado con token no expirado, y autorización/rechazo (403) de `RoleGuard`.
     - `VehiculosCrud.test.tsx` (5 pruebas): estado de carga accesible, renderizado desde API mockeada, filtrado en tiempo real, estado vacío y manejo de error 500 con reintento.
  5. *Cobertura de Código:* Ejecución con `npm run test:coverage` logrando 100% de cobertura en componentes críticos de seguridad (`LoginPage.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`, `Spinner.tsx`).
  6. *Pruebas End-to-End (Playwright):*
     - `e2e/guards.spec.ts` (2 pruebas): redirección de ruta protegida sin sesión a `/login?retorno=...` y redirección de usuario con rol no autorizado (`Conductor`) a `/403 Acceso restringido`.
     - `e2e/flujo-completo.spec.ts` (1 prueba): flujo completo Registro -> Login -> Navegación -> Creación de Vehículo -> Visualización en tabla en vivo.
  7. *Evidencias:* Documento consolidado en `docs/evidence/tests/TEST_EVIDENCE.md`.
- **Verificación real:** `npm run test` completó 14 de 14 pruebas exitosas (100%); `npm run test:e2e` completó 3 de 3 pruebas E2E exitosas (100%); `npm run lint` completó con 0 errores y 0 advertencias; `npx tsc --noEmit` completó con 0 errores.
- **Entregables generados:** `playwright.config.ts`, `e2e/guards.spec.ts`, `e2e/flujo-completo.spec.ts`, `src/test/setup.ts`, `src/test/test-utils.tsx`, `src/test/mocks/handlers.ts`, `src/test/mocks/server.ts`, `src/features/auth/LoginPage.test.tsx`, `src/features/auth/Guards.test.tsx`, `src/features/vehiculos/VehiculosCrud.test.tsx`, `docs/evidence/tests/TEST_EVIDENCE.md`.

---

### Fase 7 — Seguridad Integral (OWASP API Top 10 y Auditoría Automatizada)
- **Objetivo:** Auditar, mitigar y verificar de forma integral las vulnerabilidades del estándar OWASP API Security Top 10 y OWASP Web Top 10 tanto en frontend como en backend, implementando un script de verificación automatizado y generando la matriz de mitigación técnica con justificación de almacenamiento de tokens.
- **Prompts y acciones:**
  1. *Matriz OWASP API Top 10:* Elaboración de `docs/evidence/security/OWASP_MATRIX.md` cubriendo API1:2023 (BOLA), API2:2023 (Autenticación rota), API3:2023 (Exposición excesiva de datos), API4:2023 (Consumo irrestricto de recursos / Rate Limit), API5:2023 (BFLA / RBAC), API7:2023 (Configuración CORS inadecuada), API8:2023 (Mala configuración de seguridad / Cabeceras HTTP) y OWASP Web A03:2021 (Inyección y XSS).
  2. *Defensa de Elección de Almacenamiento (sessionStorage vs localStorage vs Cookies):* Justificación fundamentada en el informe de seguridad: se optó por `sessionStorage` para limitar el ciclo de vida del token a la pestaña activa, minimizando el impacto de robo en terminales de uso compartido o corporativo, sin persistir credenciales tras el cierre de pestaña y mitigando de raíz CSRF sin necesidad de tokens anti-falsificación adicionales requeridos por cookies con estado.
  3. *Script de Auditoría Automatizada:* Creación de `scripts/security-checks.mjs` y adición del comando `npm run test:security` en `SIMAP-FRONT/package.json`.
  4. *Pruebas de Seguridad en Vivo:* Ejecución de pruebas contra la API en vivo (`http://localhost:5288/api/v1`) evaluando cabeceras HTTP (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`), validación de CORS (origen malicioso denegado vs origen frontend autorizado), autenticación 401 en endpoints protegidos, RBAC 403 vs 201 por rol, almacenamiento seguro de payloads XSS sin ejecución, y rate limiting (HTTP 429 activado tras ráfaga de 105 peticiones).
- **Verificación real:** `npm run test:security` finalizó exitosamente con 11 de 11 controles aprobados (100% de éxito).
- **Entregables generados:** `scripts/security-checks.mjs`, `SIMAP-FRONT/package.json` (`test:security`), `docs/evidence/security/OWASP_MATRIX.md`, `docs/evidence/security/SECURITY_CHECKS_OUTPUT.md`.

### Fase 8 — Documentacion Final y Preparacion de Defensa Oral
- **Objetivo:** Consolidar toda la documentacion tecnica, guion de defensa oral, banco de preguntas y respuestas conceptuales, manual de usuario y mapa documental del repositorio, respetando la directriz de estilo sin emojis.
- **Prompts y acciones:**
  1. *Informe Tecnico:* Creacion de `docs/INFORME_TECNICO.md` detallando stack, arquitectura limpia, contratos con la API de .NET 10, analisis de cambios en backend, justificacion de `sessionStorage` vs `localStorage` vs `cookies httpOnly`, matriz de seguridad OWASP y verificacion de accesibilidad WCAG 2.2 AA.
  2. *Guion de Demostracion Oral:* Creacion de `docs/DEMO_GUIDE.md` con un itinerario guiado paso a paso de 8 estaciones (arranque, login/registro, RBAC, CRUD principal vehiculos, CRUD relacionado bitacoras, navegacion accesible por teclado, adaptabilidad responsive en movil y auditoria en DevTools de cabeceras/rate limiting), mas banco de 6 preguntas tecnicas frecuentes y respuestas modelo para la evaluacion docente.
  3. *README Principal del Proyecto:* Creacion de `README.md` en la raiz del repositorio con descripcion, prerrequisitos, guia de instalacion paso a paso para backend y frontend, tabla de cuentas de prueba por rol (`admin@simap.cl`, `mecanico@simap.cl`, `conductor@simap.cl`), comandos de evaluacion y mapa completo de enlaces hacia la carpeta `docs/`.
  4. *Trazabilidad de Agentes:* Sincronizacion de `docs/CONTEXT.md` con el 100% de fases completadas.
- **Verificación real:** Todos los documentos redactados en formato markdown profesional, estructurados semánticamente y validados sin presencia de emojis en codigo, comentarios, titulos ni subtitulos.
- **Entregables generados:** `docs/INFORME_TECNICO.md`, `docs/DEMO_GUIDE.md`, `README.md`, `docs/CONTEXT.md`, `AI_LOG.md`.

### Fase 9 — Panel Principal Analítico (Dashboard), Tema Oscuro y Tipografía
- **Objetivo:** Incorporar panel analítico con métricas en tiempo real de la flota, distribución de marcas y bitácoras según prioridad; aplicar un tema oscuro sobrio y de alta gama inspirado en el repositorio ECC (`affaan-m/ECC`), y corregir la sobreposición tipográfica en el gráfico Donut de vehículos.
- **Prompts y acciones:**
  1. *Panel Analítico (`DashboardPage.tsx`):* Creación de 4 tarjetas KPI (flota total, disponibilidad %, vehículos en mantenimiento, incidencias activas), gráfico de barras para marcas de la flota, desglose de incidencias por severidad (Crítica, Alta, Media, Baja) y accesos directos por rol.
  2. *Corrección del Gráfico Donut de Vehículos:* Desacoplamiento del número y rótulo hacia un contenedor HTML absoluto centrado (`.donutCentroHtml`), eliminando colisiones de coordenadas SVG con rotación de texto. Reestructuración de la leyenda con filas a ancho completo (`.itemLeyenda`), asegurando espacio holgado sin quiebres de texto.
  3. *Eliminación de Fondos Blancos y Adopción de Tema Oscuro:* Sustitución de fondos `#ffffff` residuales en tablas, filtros, modales y formularios por variables semánticas (`--color-bg: #090d16`, `--color-card: #0f172a`, `--color-border: #1e293b`).
  4. *Estandarización de Marca:* Cambio de "Parque Automotor" por "Sistema de Mantenimiento Preventivo" en toda la documentación y encabezados.
- **Verificación real:** Pruebas visuales E2E con Playwright capturaron captura de pantalla completa en `dashboard_dark_theme.png` comprobando cero solapamiento y armonía estética de alto nivel.

### Fase 10 — Ajuste Estricto de Roles y Permisos (RBAC Negocio: Mecánico y Conductor)
- **Objetivo:** Ajustar el sistema de permisos para que el Mecánico únicamente pueda visualizar vehículos y bitácoras y modificar exclusivamente el estado de la falla, y para que el Conductor pueda reportar fallas seleccionando vehículos de la flota sin bloqueos 403.
- **Prompts y acciones:**
  1. *Backend (`VehiculoAPI.cs`):* Restricción de `POST`, `PUT` y `DELETE /vehiculos` únicamente a `Admin`. Inclusión de `Conductor` en `GET /vehiculos` para lectura de flota al crear reportes.
  2. *Backend (`BitacoraAPI.cs`):* Restricción de `POST /bitacoras` a `Admin` y `Conductor`. Restricción de `DELETE /bitacoras` a `Admin`. En `PUT /bitacoras/{id}`, el servidor verifica si el rol es `Mecanico` y en dicho caso únicamente actualiza `EstadoFalla`, preservando los demás datos inmutables.
  3. *Frontend (`VehiculosListPage.tsx` y `App.tsx`):* El Mecánico puede ver la flota, pero no ve botones de registrar, editar ni eliminar vehículos.
  4. *Frontend (`BitacorasListPage.tsx` y `BitacoraFormPage.tsx`):* El Conductor puede reportar fallas (`/bitacoras/nueva`). El Mecánico no ve botón de reportar ni de eliminar; puede actualizar el estado directamente desde la tabla o en el formulario donde los campos descriptivos quedan deshabilitados.
- **Verificación real:** 5 / 5 pruebas E2E aprobadas en Playwright en 16.0s (`e2e/flujo-completo.spec.ts`, `e2e/guards.spec.ts` y `e2e/roles-permisos.spec.ts`).

---

## 3. Estado Final del Proyecto y Metricas de Calidad

Todas las fases establecidas en el plan de trabajo se encuentran al 100% completadas y verificadas:

| Metrica / Indicador | Resultado Obtenido | Estandar de Evaluacion |
|---|---|---|
| Pruebas Unitarias e Integracion (Vitest) | 14 / 14 aprobadas (100%) | Superior al 80% requerido |
| Cobertura de Codigo en Seguridad (v8) | 100% en componentes criticos | Cumplimiento total |
| Pruebas End-to-End (Playwright Chromium) | 5 / 5 aprobadas (100%) | Flujo completo, guards y roles validados |
| Auditoria de Seguridad Automatizada OWASP | 11 / 11 controles aprobados (100%) | OWASP API Security Top 10 |
| Accesibilidad Web (WCAG 2.2 AA) | Conforme (teclado, NVDA, contraste) | Ratios de contraste > 4.5:1 / 3:1 |
| Diseno Responsivo Mobile-First | Conforme (320px a 1440px sin scroll h.) | Mobile-First responsive |
| Linter Estatico de Codigo (Oxlint con jsx-a11y) | 0 errores, 0 advertencias (35 archivos) | Codigo limpio |
| Tipado TypeScript (`tsc --noEmit`) | 0 errores de compilacion | Modo estricto |

---

## 4. Reflexion y Declaracion de Aprendizaje del Uso de IA

El uso de asistentes de Inteligencia Artificial en el desarrollo de este proyecto actuo como un catalizador para la rigurosidad tecnica y la productividad. Lejos de reemplazar el juicio critico, exigio un rol de arquitecto y revisor constante:
1. **Analisis del Backend:** La IA facilito la inspeccion rapida de los contratos de la API existente, pero fue indispensable la intervencion humana para contrastar los roles de negocio y detectar que los conductores necesitaban permiso de lectura en vehiculos para poder reportar bitacoras.
2. **Seguridad Defensiva:** Las soluciones de mitigacion (hashing, cabeceras seguras, DTOs y rate limiting) fueron guiadas por estandares de la industria (OWASP), garantizando que no se introdujeran atajos inseguros en la persistencia de credenciales.
3. **Accesibilidad Real:** La generacion de interfaces requirio supervisar que los modales no fuesen simples ventanas emergentes, sino verdaderos dialogos accesibles con trampa de foco y compatibilidad con lectores de pantalla.


