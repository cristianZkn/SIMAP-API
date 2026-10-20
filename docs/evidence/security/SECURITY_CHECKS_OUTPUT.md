# Reporte de Ejecucion de Pruebas de Seguridad Automatizadas — SIMAP

**Fecha de Ejecucion:** 2026-10-20T03:59:52.308Z
**Servidor Evaluado:** http://localhost:5288/api/v1
**Total de Controles Evaluados:** 11
**Controles Exitosos:** 11
**Controles Fallidos:** 0

Estado Global: **CONFORME (100% de controles aprobados)**

---

## Resultados Detallados de la Auditoria

| Control Evaluado | Descripcion del Ensayo | Valor Esperado | Valor Obtenido | Resultado |
|---|---|---|---|---|
| **OWASP API8: Cabeceras** | X-Content-Type-Options configurado en nosniff | `nosniff` | `nosniff` | **PASADO** |
| **OWASP API8: Cabeceras** | X-Frame-Options configurado en DENY (Anti-Clickjacking) | `DENY` | `DENY` | **PASADO** |
| **OWASP API8: Cabeceras** | Referrer-Policy configurado en strict-origin-when-cross-origin | `strict-origin-when-cross-origin` | `strict-origin-when-cross-origin` | **PASADO** |
| **OWASP API8: Cabeceras** | X-XSS-Protection configurado en 1; mode=block | `1; mode=block` | `1; mode=block` | **PASADO** |
| **OWASP API7: CORS** | Rechazo de origen malicioso no autorizado | `null (sin cabecera allow-origin)` | `null` | **PASADO** |
| **OWASP API7: CORS** | Permision explicita del origen legítimo del frontend | `http://localhost:5173` | `http://localhost:5173` | **PASADO** |
| **OWASP API2: Autenticacion** | Peticion a endpoint protegido sin token devuelve HTTP 401 | `401` | `401` | **PASADO** |
| **OWASP API5: RBAC** | Conductor intentando POST /vehiculos devuelve HTTP 403 Forbidden | `403` | `403` | **PASADO** |
| **OWASP API5: RBAC** | Administrador autorizado creando vehiculo devuelve HTTP 201 Created | `201` | `201` | **PASADO** |
| **OWASP A03: XSS** | Payload malicioso almacenado como texto plano sin ejecucion en servidor | `Almacenado como texto plano literal` | `Texto plano intacto` | **PASADO** |
| **OWASP API4: Rate Limiting** | Exceso de peticiones concurrentes activa HTTP 429 Too Many Requests | `429` | `429` | **PASADO** |

---

## Conclusiones Tecnicas

1. **Cabeceras HTTP de Seguridad (OWASP API8):** Las cabeceras `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy` y `X-XSS-Protection` se encuentran activas en el middleware de ASP.NET Core, mitigando ataques de clickjacking y sniffing de MIME.
2. **Aislamiento CORS (OWASP API7):** Las peticiones de orígenes no reconocidos como `http://sitio-malicioso.com` son rechazadas sin cabecera `Access-Control-Allow-Origin`, mientras que el origen legitimo `http://localhost:5173` es admitido correctamente.
3. **Autenticacion y RBAC (OWASP API2 y API5):** La API exige token Bearer en todas las rutas operativas (retornando HTTP 401 si falta). Ademas, usuarios con rol Conductor son interceptados con HTTP 403 al intentar registrar o alterar vehiculos.
4. **Inyeccion y XSS (OWASP A03):** El motor de base de datos almacena cadenas con caracteres especiales como texto plano sin interpretacion. En el frontend, React JSX renderiza todo contenido dentro de nodos de texto nativos sin interpretar etiquetas `<script>` ni atributos de evento, eliminando vectores XSS.
5. **Rate Limiting (OWASP API4):** El limitador de ventana fija de ASP.NET Core protege los recursos del servidor denegando peticiones excesivas con HTTP 429 Too Many Requests.
