# SIMAP — Sistema de Mantenimiento Preventivo

Evaluacion UT2: Trabajo 2 — Frontend React, Consumo de API RESTful y Seguridad Integral  
Asignatura: Lenguaje de Programacion Web II  
Fecha de Entrega: 20-10-2026  

---

## 1. Descripcion General del Proyecto

**SIMAP** es una solucion integral orientada a la administracion, control operativo y mantenimiento preventivo y correctivo de flotas vehiculares. 

El repositorio contiene dos subsistemas desacoplados y coordinados:
- **Backend (`SIMAP/`):** API RESTful desarrollada con .NET 10 Minimal APIs, Entity Framework Core y SQL Server LocalDB. Dispone de autenticacion JWT, autorizacion por roles (RBAC: Admin, Mecanico, Conductor), proteccion contra abuso de recursos (Rate Limiting de 100 req/min), politicas CORS restrictivas y cabeceras HTTP de seguridad OWASP.
- **Frontend (`SIMAP-FRONT/`):** Aplicacion SPA reactiva desarrollada con React 19, TypeScript estricto y Vite. Consume la API de forma tipada, gestiona el estado asincrono con TanStack Query v5, valida formularios mediante React Hook Form y Zod, almacena sesiones efimeras en `sessionStorage`, y garantiza conformidad estricta con las pautas de accesibilidad **WCAG 2.2 nivel AA** y diseno **mobile-first** responsivo.

---

## 2. Requisitos Previos del Entorno

Antes de inicializar la aplicacion, asegurese de disponer de las siguientes herramientas instaladas en su equipo:
- **.NET SDK 10.0** (o superior).
- **Node.js v20.x** o superior (recomendado v22.x LTS) junto con **npm v10.x**.
- **Microsoft SQL Server LocalDB** (instalado de forma estandar con Visual Studio o SQL Server Express).
- Navegador web moderno (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).

---

## 3. Guia de Instalacion y Ejecucion Local

### 3.1 Clonacion del Repositorio
```bash
git clone https://github.com/cristianZkn/SIMAP-API.git
cd SIMAP-API
```

### 3.2 Puesta en Marcha del Backend (.NET 10)
1. Desplacese a la carpeta del backend:
   ```bash
   cd SIMAP
   ```
2. Restaure las dependencias y aplique migraciones o cree la base de datos local (si es primera ejecucion):
   ```bash
   dotnet restore
   dotnet run --launch-profile http
   ```
3. El servicio estara disponible de forma predeterminada en:
   - **URL Base:** `http://localhost:5288/api/v1`
   - **Documentacion Interactiva Scalar:** `http://localhost:5288/scalar/v1`

### 3.3 Puesta en Marcha del Frontend (React 19 + Vite)
1. En una nueva terminal, desplacese a la carpeta del cliente:
   ```bash
   cd SIMAP-FRONT
   ```
2. Instale las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
4. Abra su navegador web e ingrese a:
   - **Aplicacion Web:** `http://localhost:5173`

---

## 4. Cuentas de Acceso y Roles Preconfigurados

Para probar y evaluar los distintos niveles de autorizacion (RBAC), utilice las siguientes credenciales:

| Rol Asignado | Correo Electronico | Contrasena | Alcance y Permisos |
|---|---|---|---|
| **Administrador** | `admin@simap.cl` | `Admin123!` | Acceso completo: Creacion, edicion, consulta y eliminacion de Vehiculos, Bitacoras, Mantenimientos y Usuarios. |
| **Mecanico** | `mecanico@simap.cl` | `Mecanico123!` | Operativo de taller: Gestion completa de Vehiculos y Bitacoras de Fallas asociadas. |
| **Conductor** | `conductor@simap.cl` | `Conductor123!` | Operador de ruta: Solo consulta del catalogo vehicular y reporte de incidencias en Bitacoras. Bloqueo 403 en gestion vehicular. |

> Nota: Tambien puede crear nuevos usuarios con cualquiera de estos roles accediendo a la ruta `/registro` desde la interfaz.

---

## 5. Comandos de Verificacion, Calidad y Pruebas

Desde el directorio `SIMAP-FRONT/`, ejecute los siguientes comandos segun la evaluacion requerida:

### 5.1 Pruebas Unitarias y de Integracion (Vitest + MSW 3)
Ejecuta la suite de pruebas unitarias sobre componentes de autenticacion, guards de seguridad y flujos CRUD:
```bash
npm run test
```

Para generar el reporte detallado de cobertura de codigo:
```bash
npm run test:coverage
```

### 5.2 Pruebas End-to-End (Playwright)
Ejecuta las pruebas de integracion en vivo en navegador Chromium automatizado (valida redirecciones de guards, bloqueo 403 y ciclo de vida completo de creacion de vehiculo):
```bash
npm run test:e2e
```

### 5.3 Auditoria Automatizada de Seguridad OWASP
Ejecuta el script de auditoria que valida cabeceras de seguridad, CORS, autenticacion 401, autorizacion 403, neutralizacion de XSS y limite de tasa (Rate Limiting HTTP 429) contra el servidor activo:
```bash
npm run test:security
```
*(O directamente desde la raiz: `node scripts/security-checks.mjs`)*

### 5.4 Comprobacion de Tipado y Linter de Accesibilidad
```bash
# Validacion estricta de TypeScript
npx tsc --noEmit

# Analisis estatico de codigo y reglas de accesibilidad (jsx-a11y)
npm run lint

# Compilacion optimizada para produccion
npm run build
```

---

## 6. Mapa de Documentacion Tecnica y Evidencias

Toda la documentacion de respaldo, analisis y evidencias de auditoria se encuentra centralizada en la carpeta `docs/`:

| Documento | Descripcion y Contenido |
|---|---|
| [`docs/INFORME_TECNICO.md`](file:///b:/proyectos/SIMAP/docs/INFORME_TECNICO.md) | Informe tecnico exhaustivo de la entrega: arquitectura, stack, analisis de backend, justificacion de `sessionStorage`, matriz de seguridad y accesibilidad. |
| [`docs/DEMO_GUIDE.md`](file:///b:/proyectos/SIMAP/docs/DEMO_GUIDE.md) | Guion paso a paso de 5 a 10 minutos para la defensa oral del estudiante y banco de preguntas tecnicas frecuentes del docente. |
| [`docs/BACKEND_DISCOVERY.md`](file:///b:/proyectos/SIMAP/docs/BACKEND_DISCOVERY.md) | Analisis de ingenieria inversa del backend del Trabajo 1: contrato de endpoints, roles, formato de errores y fallas iniciales. |
| [`docs/BACKEND_CHANGES.md`](file:///b:/proyectos/SIMAP/docs/BACKEND_CHANGES.md) | Registro detallado de cambios de hardening aplicados al backend (CORS, DTOs sin password, cabeceras, orden de pipeline). |
| [`docs/evidence/security/OWASP_MATRIX.md`](file:///b:/proyectos/SIMAP/docs/evidence/security/OWASP_MATRIX.md) | Matriz de correspondencia con el estandar OWASP API Security Top 10 y tecnicas de mitigacion. |
| [`docs/evidence/security/SECURITY_CHECKS_OUTPUT.md`](file:///b:/proyectos/SIMAP/docs/evidence/security/SECURITY_CHECKS_OUTPUT.md) | Reporte de ejecucion en vivo del script automatizado de seguridad (11/11 controles superados). |
| [`docs/evidence/tests/TEST_EVIDENCE.md`](file:///b:/proyectos/SIMAP/docs/evidence/tests/TEST_EVIDENCE.md) | Evidencia de ejecucion y resultados de suites de prueba Vitest y Playwright. |
| [`docs/evidence/a11y/MANUAL_CHECKLIST.md`](file:///b:/proyectos/SIMAP/docs/evidence/a11y/MANUAL_CHECKLIST.md) | Protocolo de verificacion manual de accesibilidad WCAG 2.2 AA y guia de uso con lector de pantalla NVDA. |
| [`docs/evidence/responsive/RESPONSIVE_EVIDENCE.md`](file:///b:/proyectos/SIMAP/docs/evidence/responsive/RESPONSIVE_EVIDENCE.md) | Matriz de resoluciones responsivas (320px a 1440px) y transformacion de tablas a tarjetas. |
| [`docs/CONTEXT.md`](file:///b:/proyectos/SIMAP/docs/CONTEXT.md) | Memoria persistente y trazabilidad de avance fase por fase para desarrolladores y agentes de IA. |
| [`AI_LOG.md`](file:///b:/proyectos/SIMAP/AI_LOG.md) | Bitacora academica obligatoria de uso de herramientas de Inteligencia Artificial segun directrices de la asignatura. |
