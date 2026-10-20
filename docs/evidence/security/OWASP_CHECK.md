# Matriz de Mitigacion de Riesgos OWASP — SIMAP

Este documento detalla la correspondencia entre los riesgos de seguridad definidos en el estándar **OWASP API Security Top 10 (2023)** y **OWASP Top 10 (2021)**, las vulnerabilidades mitigadas, la capa de arquitectura responsable y los archivos o mecanismos concretos implementados en SIMAP (Sistema de Mantenimiento de Parque Automotor) para el Trabajo 2.

---

## 1. Matriz de Controles y Mitigaciones OWASP

| Identificador OWASP | Categoria de Riesgo | Vulnerabilidad Previa / Riesgo Potencial | Capa | Mecanismo de Mitigacion y Archivo Responsable | Estado |
|---|---|---|---|---|---|
| **OWASP API1:2023** | Broken Object Level Authorization (BOLA) | Manipulacion de identificadores en URLs (`/api/v1/vehiculos/{id}`) para consultar o alterar registros ajenos sin validacion | Backend | Validación de permisos por rol en cada endpoint y verificacion de existencia previa mediante `IRepositorio<T>.ObtenerPorIdAsync(id)`. Implementado en `SIMAP/Endpoints/VehiculoAPI.cs` y `BitacoraAPI.cs`. | Mitigado |
| **OWASP API2:2023** | Broken Authentication | Credenciales en query string, tokens JWT debiles, contrasenas en texto plano o exposicion de tokens en almacenamiento inseguro | Backend y Frontend | 1. **Backend:** Registro con contrasena en el body JSON (`RegistroRequest`) en `AuthAPI.cs`. Hasheo criptografico con `PasswordHasher<Usuario>` (PBKDF2 con HMAC-SHA256 y sal aleatoria) en `AuthService.cs`. Emision de JWT con firma HMAC-SHA256, expiracion controlada (2 horas) e Issuer/Audience validados en `Program.cs`.<br>2. **Frontend:** El token JWT se almacena exclusivamente en `sessionStorage` (aislado por pestana, se destruye al cerrar la sesion o la pestana, nunca en `localStorage`). Validacion de expiracion en cliente (`isTokenExpired`) antes de aceptar una sesion activa en `AuthContext.tsx`. | Mitigado |
| **OWASP API3:2023** | Broken Object Property Level Authorization | Exposicion excesiva de datos sensibles (Mass Assignment / Data Exposure), como el campo `PasswordHash` en respuestas JSON | Backend | Creacion y uso estricto del DTO `UsuarioDto` en `SIMAP/Models/UsuarioDto.cs`. Todos los endpoints de usuarios y autenticacion (`AuthAPI.cs`, `UsuarioAPI.cs`) mapean y devuelven unicamente datos publicos (`id`, `nombre`, `email`, `rol`, `activo`). El campo `PasswordHash` nunca viaja al cliente. | Mitigado |
| **OWASP API4:2023** | Unrestricted Resource Consumption | Ataques de denegacion de servicio (DoS) o fuerza bruta mediante envio masivo e indiscriminado de peticiones HTTP | Backend | Middleware de Rate Limiting nativo de ASP.NET Core configurado en `SIMAP/Program.cs` (`AddRateLimiter` con algoritmo `FixedWindowRateLimiter`). Umbral: maximo 100 peticiones por ventana de 1 minuto por IP remota. Al excederse, responde con codigo HTTP `429 Too Many Requests`. | Mitigado |
| **OWASP API5:2023** | Broken Function Level Authorization | Usuarios con roles de menor privilegio (ej. Conductor) ejecutando acciones restringidas a administradores o mecanicos | Backend y Frontend | 1. **Backend (Mandatorio):** Politica de autorizacion basada en roles mediante `.RequireRole("Admin", "Mecanico")` en operaciones de escritura de vehiculos (`POST`, `PUT`, `DELETE`), y restriccion exclusiva de usuarios a `Admin`. Configurado en `VehiculoAPI.cs`, `UsuarioAPI.cs` y `BitacoraAPI.cs`.<br>2. **Frontend (Visual):** `RoleGuard.tsx` y `ProtectedRoute.tsx` interceptan la navegacion hacia rutas no autorizadas redirigiendo a `/403 Acceso restringido` o `/login?retorno=...`. Enlaces de navegacion ocultos condicionalmente segun el rol del usuario en `Layout.tsx`. | Mitigado |
| **OWASP API7:2023** | Server-Side Request Forgery (SSRF) / CORS Inseguro | Configuracion permisiva de CORS (`*` o `AllowAnyOrigin`) permitiendo peticiones no autorizadas desde sitios web maliciosos | Backend | Politica estricta de CORS `PermitirFrontend` en `SIMAP/Program.cs`. Solo se admiten orígenes explicitos (`http://localhost:5173`, `http://localhost:3000` y el origen configurado en `FRONTEND_URL`). Cualquier origen malicioso es rechazado sin cabecera `Access-Control-Allow-Origin`. `app.UseCors()` posicionado antes de `UseAuthentication()` en el pipeline HTTP para responder preflights `OPTIONS` y codigos `401/403` con CORS valido. | Mitigado |
| **OWASP API8:2023** | Security Misconfiguration | Cabeceras HTTP inseguras, exposicion de trazas de error internas (stack traces) y sniffing de tipos MIME | Backend | Middleware personalizado en `SIMAP/Program.cs` que inyecta cabeceras HTTP de proteccion en todas las respuestas: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`. Manejador global `UseExceptionHandler` que oculta detalles internos en entornos productivos devolviendo un mensaje generico JSON con codigo `500`. | Mitigado |
| **OWASP A03:2021** | Injection / Cross-Site Scripting (XSS) | Inyeccion de scripts maliciosos (`<script>`, eventos onerror) en campos de texto (ej. placa, descripcion de bitacoras) | Frontend y Backend | 1. **React JSX:** Neutralizacion automatica de cadenas mediante creacion de nodos de texto nativos (`createTextNode`), impidiendo interpretacion HTML de caracteres `< > " '`. Prohibicion estricta del uso de `dangerouslySetInnerHTML`.<br>2. **Validacion de esquema:** Schemas de validacion Zod en cliente que rechazan datos malformados antes del envio.<br>3. **Persistencia parametrizada:** Entity Framework Core utiliza consultas SQL parametrizadas para todas las interacciones con LocalDB SQL Server, neutralizando cualquier intento de inyeccion SQL. | Mitigado |

---

## 2. Analisis de la Estrategia de Almacenamiento del Token JWT

### Comparacion de Opciones de Almacenamiento en Cliente:

| Mecanismo | Proteccion XSS | Proteccion CSRF | Comportamiento al Cerrar Pestana | Justificacion de Eleccion en SIMAP |
|---|---|---|---|---|
| **localStorage** | Vulnerable si existe XSS | Inmune | Persiste indefinidamente | Descartado: mantiene el token vivo incluso despues de cerrar el navegador, aumentando el tiempo de exposicion de la sesion. |
| **Cookie HttpOnly + SameSite=Strict** | Alta (inmune a lectura por JS) | Requiere proteccion CSRF | Depende de expiracion de cookie | Descartado: el backend Minimal APIs existente no implementa cookies de sesion ni endpoints de rotacion de refresh tokens, requiriendo cabecera `Authorization: Bearer <token>`. |
| **sessionStorage** (Seleccionado) | Vulnerable si existe XSS | Inmune | Se destruye automaticamente al cerrar la pestana | **Adoptado:** El token sobrevive a recargas accidentales de pagina (`F5`), pero se destruye de inmediato al cerrar la pestana. El riesgo de XSS se mitiga en profundidad mediante el renderizado seguro de React, la validacion estricta de esquemas Zod y la eliminacion de APIs de inyeccion de HTML. |

---

## 3. Verificacion Automatizada de Controles

La efectividad de estos controles es validada mediante:
1. Pruebas End-to-End con Playwright (`e2e/guards.spec.ts` y `e2e/flujo-completo.spec.ts`).
2. Pruebas de integracion con Vitest y MSW (`src/features/auth/Guards.test.tsx` y `LoginPage.test.tsx`).
3. Script automatizado de auditoria de seguridad `scripts/security-checks.mjs`, que comprueba en vivo contra el servidor activo:
   - Presencia de cabeceras de seguridad.
   - Rechazo de orígenes CORS no autorizados.
   - Respuesta 401 en accesos sin token.
   - Respuesta 403 en accesos con rol insuficiente.
   - Neutralizacion de inyeccion de scripts en campos de texto.
   - Comportamiento ante consumo masivo de recursos (Rate Limiting 429).
