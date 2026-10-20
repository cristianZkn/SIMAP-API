# Evidencia de Pruebas Automatizadas (Unitarias, Integracion y E2E) — SIMAP

Este documento consolida los resultados, comandos de ejecucion y evidencias de las pruebas automatizadas del frontend de SIMAP (Sistema de Mantenimiento de Parque Automotor), cubriendo pruebas unitarias, de integracion con Mock Service Worker (MSW) y pruebas End-to-End (E2E) con Playwright.

---

## 1. Resumen General de Pruebas

| Categoria | Herramientas | Suites | Pruebas Totales | Exitosas | Fallidas | Estado |
|---|---|---|---|---|---|---|
| **Unitarias e Integracion** | Vitest 5 + Testing Library + MSW 3 | 3 | 14 | 14 | 0 | Conforme |
| **End-to-End (E2E)** | Playwright 1.64 (Chromium) | 2 | 3 | 3 | 0 | Conforme |
| **Total Global** | | **5** | **17** | **17** | **0** | **100% Exitoso** |

---

## 2. Pruebas Unitarias y de Integracion (Vitest + React Testing Library + MSW)

Comando de ejecucion:
```bash
npm run test
```

### Detalle de Suites y Casos de Prueba

#### A. Formulario de Inicio de Sesion (`src/features/auth/LoginPage.test.tsx`)
1. **Renderizado de formulario:** Verifica presencia de encabezado h1 `SIMAP`, campos de texto accesibles con su etiqueta `<label htmlFor="...">` y boton de envio.
2. **Validacion sincrona Zod (campos vacios):** Verifica mensajes de error en espanol si se envia el formulario vacio sin realizar peticion HTTP.
3. **Validacion de formato de email:** Comprueba la deteccion de formato invalido mediante Zod (`Ingresa un email valido`).
4. **Manejo de error 401 del servidor:** Simula credenciales erroneas con MSW y verifica la presencia de la alerta accesible (`role="alert"`) con el texto `Credenciales incorrectas`.
5. **Autenticacion exitosa y persistencia:** Simula credenciales validas, guarda el token JWT y datos en `sessionStorage` y verifica la respuesta.

#### B. Proteccion de Rutas y Roles (`src/features/auth/Guards.test.tsx`)
1. **ProtectedRoute (Sin sesion):** Redirige a `/login` si no existe token en `sessionStorage`.
2. **ProtectedRoute (Con sesion):** Valida la firma y expiracion del JWT y permite renderizar el contenido protegido.
3. **RoleGuard (Rol autorizado):** Permite acceso a la vista si el rol del usuario (ej. `Admin`) esta dentro de los `rolesPermitidos`.
4. **RoleGuard (Rol no autorizado):** Redirige a `/403` si el rol del usuario (ej. `Conductor`) carece de privilegios para la ruta.

#### C. Flujo CRUD de Vehiculos (`src/features/vehiculos/VehiculosCrud.test.tsx`)
1. **Estado de carga:** Verifica que se muestre el indicador visual accesible (`role="status"`) con texto `Cargando flota de vehiculos...`.
2. **Renderizado de datos:** Intercepta la peticion `GET /api/v1/vehiculos` mediante MSW y renderiza placas (`ABC-123`, `XYZ-789`), marcas y badges de estado.
3. **Filtro interactivo en tiempo real:** Escribe en el campo de busqueda y comprueba que se filtran los elementos en memoria sin recargar la pagina.
4. **Estado vacio:** Escribe un termino inexistente y comprueba el mensaje accesible de busqueda sin resultados.
5. **Manejo de errores de red (500):** Sobrescribe el handler MSW para simular caida del servidor, verificando la alerta de error y el boton `Reintentar`.

### Salida de Ejecucion de Vitest
```text
 RUN  v5.0.5 B:/proyectos/SIMAP/SIMAP-FRONT

 ✓ src/features/auth/Guards.test.tsx (4 tests) 76ms
 ✓ src/features/vehiculos/VehiculosCrud.test.tsx (5 tests) 968ms
 ✓ src/features/auth/LoginPage.test.tsx (5 tests) 1915ms

 Test Files  3 passed (3)
      Tests  14 passed (14)
   Duration  5.73s
```

---

## 3. Reporte de Cobertura de Codigo (Vitest + V8)

Comando de ejecucion:
```bash
npm run test:coverage
```

### Tabla de Cobertura por Archivo Clave
```text
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   33.74 |    24.85 |   26.54 |   33.83 |                   
 src/features/auth |   60.39 |    51.61 |   59.09 |   61.85 |                   
  AuthContext.tsx  |   66.66 |       75 |      80 |   70.96 | 53-56,62-63,81-83 
  LoginPage.tsx    |     100 |      100 |     100 |     100 |                   
  ProtectedRoute   |     100 |      100 |     100 |     100 |                   
  RoleGuard.tsx    |     100 |      100 |     100 |     100 |                   
 src/features/vehiculos
  VehiculosListPage|   61.22 |    83.33 |      40 |    62.5 | 58,134,162,229-284
 src/shared/api    |   65.11 |       50 |     100 |    67.5 |                   
  httpClient.ts    |   65.11 |       50 |     100 |    67.5 | 46,71-72,78
 src/shared/components
  Spinner.tsx      |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```
- Cobertura del **100%** de sentencias, ramas y funciones en componentes criticos de seguridad y autenticacion (`LoginPage.tsx`, `ProtectedRoute.tsx`, `RoleGuard.tsx`).

---

## 4. Pruebas End-to-End (Playwright)

Comando de ejecucion:
```bash
npm run test:e2e
```

Las pruebas E2E interactuan con la aplicacion completa levantada en `http://localhost:5173` y conectada con la API real en `http://localhost:5288`.

### Detalle de Suites E2E

#### A. Proteccion y Guards (`e2e/guards.spec.ts`)
1. **Acceso sin sesion:** Visita `/vehiculos` sin autenticacion. Verifica que la aplicacion redirige de forma transparente a `/login?retorno=%2Fvehiculos`.
2. **Acceso con rol restringido:** Registra un usuario con rol Conductor (ID: 4), inicia sesion y comprueba que el `RoleGuard` impide el acceso a la gestion de flota vehicular redirigiendo a la pantalla `403 Acceso restringido`.

#### B. Flujo Completo de Negocio (`e2e/flujo-completo.spec.ts`)
1. **Registro:** Da de alta un usuario Administrador con correo unico generado con timestamp.
2. **Login:** Inicia sesion en `/login` con la cuenta recien creada.
3. **Navegacion:** Ingresa al modulo `/vehiculos`.
4. **Alta de Recurso:** Hace clic en `Registrar Vehiculo`, completa el formulario con datos tecnicos (placa unica `E2E-XXX`, marca Toyota, modelo Hilux 4x4, ano 2024, kilometraje 18500, estado Operativo) y envia los datos.
5. **Verificacion en Listado:** Espera la redireccion automatica a `/vehiculos` y confirma la presencia visual del nuevo vehiculo en la tabla.

### Salida de Ejecucion de Playwright
```text
> simap-front@0.0.0 test:e2e
> playwright test

Running 3 tests using 1 worker

  ok 1 [chromium] › e2e\flujo-completo.spec.ts:4:3 › Flujo Completo de Negocio SIMAP (E2E) › Login -> Navegación -> Creación de Vehículo -> Visualización en Listado (3.7s)
  ok 2 [chromium] › e2e\guards.spec.ts:4:3 › Guards de Seguridad y Protección de Rutas (E2E) › intento de acceder a ruta protegida sin autenticación redirige a /login con parámetro de retorno (519ms)
  ok 3 [chromium] › e2e\guards.spec.ts:19:3 › Guards de Seguridad y Protección de Rutas (E2E) › intento de acceder a ruta no autorizada por rol redirige a /403 Acceso Denegado (2.9s)

  3 passed (8.5s)
```
