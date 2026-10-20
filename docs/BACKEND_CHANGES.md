# BACKEND CHANGES — Cambios realizados al backend en el Trabajo 2

> Todos los cambios aplican el **mínimo necesario** para habilitar el consumo desde el frontend y cumplir los requisitos de seguridad. No se alteró ninguna lógica de negocio existente.

---

## Cambio 1 — CORS: agregar puerto 5173 de Vite
**Archivo:** `SIMAP/Program.cs`  
**Motivo (Falla F1):** El CORS original solo permitía `localhost:3000`. Vite corre por defecto en `localhost:5173`, lo que bloqueaba **todas** las peticiones del frontend con un error de CORS.  
**Qué se hizo:** Se agregó `http://localhost:5173` a la lista de orígenes permitidos. También se leyó una variable de entorno `FRONTEND_URL` para no hardcodear la URL de producción.

---

## Cambio 2 — Auth: contraseña del registro en el body JSON
**Archivo:** `SIMAP/Endpoints/AuthAPI.cs`  
**Motivo (Falla F2):** El endpoint `POST /api/v1/auth/registro` recibía la contraseña como **query parameter** (`?password=xxx`). Esto expone la contraseña en:
- Los logs del servidor web
- El historial del navegador
- Las herramientas de red del desarrollador (como URLs de navegación)

**Qué se hizo:** Se creó el record `RegistroRequest` que incluye `Nombre`, `Email`, `Password` y `RolId` en el body JSON. La firma del endpoint cambió de `(Usuario usuario, string password)` a `(RegistroRequest request)`.

---

## Cambio 3 — DTOs: eliminar `passwordHash` de las respuestas (Auth y Usuarios)
**Archivos:** `SIMAP/Models/UsuarioDto.cs`, `SIMAP/Endpoints/AuthAPI.cs`, `SIMAP/Endpoints/UsuarioAPI.cs`  
**Motivo (Falla F3 — OWASP API3):** Las respuestas de registro, login y CRUD de usuarios devolvían el objeto `Usuario` completo, incluyendo el campo `PasswordHash`. Aunque no es la contraseña en texto plano, exponer el hash es una mala práctica que facilita ataques offline de fuerza bruta.  
**Qué se hizo:** 
1. Se centralizó el record público `UsuarioDto(Id, Nombre, Email, RolId, Rol)` en `SIMAP.Models.UsuarioDto`.
2. `AuthAPI.cs` (`/auth/registro` y `/auth/login`) utiliza `UsuarioDto`.
3. `UsuarioAPI.cs` (`GET /usuarios`, `GET /usuarios/{id}`, `POST /usuarios`, `PUT /usuarios/{id}`) ahora devuelve exclusivamente colecciones e instancias de `UsuarioDto`, asegurando que `PasswordHash` jamás viaje en respuestas HTTP.

---

## Cambio 4 — Cabeceras de seguridad HTTP
**Archivo:** `SIMAP/Program.cs`  
**Motivo (Falla F4 — OWASP API8):** El backend no enviaba ninguna cabecera de seguridad HTTP, lo que lo deja sin protección contra ataques comunes de browser.  
**Qué se hizo:** Se agregó un middleware `app.Use(...)` al inicio del pipeline que añade en cada respuesta:

| Cabecera | Valor | Protección |
|---|---|---|
| `X-Content-Type-Options` | `nosniff` | Evita MIME type sniffing |
| `X-Frame-Options` | `DENY` | Evita clickjacking (iframes) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controla qué URL se envía como referrer |
| `X-XSS-Protection` | `1; mode=block` | Activa filtro XSS en browsers antiguos |

---

## Cambio 5 — Orden del Pipeline de Middlewares y Manejo de Errores Genéricos
**Archivo:** `SIMAP/Program.cs`  
**Motivo (Fallas F1 y F4 — OWASP API8):** 
1. `app.UseCors("PermitirFrontend")` estaba ubicado *después* de `UseAuthentication()` y `UseAuthorization()`. En ASP.NET Core, si CORS se ejecuta después de la autorización, las peticiones preflight (`OPTIONS`) y las respuestas 401/403 no reciben las cabeceras `Access-Control-Allow-Origin`, generando falsos bloqueos de CORS en el navegador.
2. En producción no existía un manejador de excepciones global que enmascarara errores no controlados.

**Qué se hizo:**
1. Se reordenó el pipeline: Cabeceras de Seguridad → `UseExceptionHandler` (en producción) → `UseHttpsRedirection` → `UseCors` → `UseRateLimiter` → `UseAuthentication` → `UseAuthorization` → Mapeo de Endpoints.
2. Se configuró `UseExceptionHandler` para responder con un mensaje JSON genérico (`500 Internal Server Error`) sin filtrar trazas ni esquemas de BD.

---

## Estado de la suite de pruebas del Trabajo 1
No existía proyecto de pruebas (`SIMAP.Tests`) en el repositorio del Trabajo 1. Los cambios fueron validados estáticamente y mediante compilación de la solución.
