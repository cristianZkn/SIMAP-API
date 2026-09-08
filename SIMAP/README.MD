# librerías a instalar

(herramientas-> administrador de paquetes de nuget -> consola del administrador de paquetes)

	install-package scalar.aspnetcore
	install-package microsoft.entityframeworkcore.sqlserver
	install-package microsoft.entityframeworkcore.tools
	install-package microsoft.entityframeworkcore.design
	install-package microsoft.openapi -version 2.7.6

# cadena de conexión:
## con autenticación de usuario
	Scaffold-DbContext "server=.\sqlexpress; Initial Catalog=juegosdb; user id=sa; password=ipvg2026;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models
## sin autenticación de usuario
	Scaffold-DbContext "server=.\sqlexpress; Initial Catalog=juegosdb;Trusted_Connection=True;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models

# Mitigaciones de Seguridad OWASP API Top 10 (2023)

En este proyecto se han abordado las siguientes vulnerabilidades del Top 10 de OWASP para APIs:

1. **API2:2023 - Broken Authentication (Fallo de Autenticación)**: 
   * **Problema**: Atacantes pueden comprometer contraseñas o tokens.
   * **Mitigación**: Se implementó `PasswordHasher<Usuario>` de Microsoft Identity para almacenar contraseñas mediante hashing fuerte y salting. Las sesiones se manejan mediante JWT (JSON Web Tokens) con una expiración configurada y firma validada por el servidor (Issuer/Audience verification).

2. **API4:2023 - Unrestricted Resource Consumption (Consumo de Recursos sin Restricciones)**:
   * **Problema**: La API puede ser víctima de ataques de denegación de servicio (DoS) o fuerza bruta.
   * **Mitigación**: Se integró el middleware de `RateLimiting` en .NET, limitando las peticiones a un máximo de 100 peticiones por minuto por cada IP (Fixed Window).

3. **API5:2023 - Broken Function Level Authorization (Fallo de Autorización a Nivel de Función)**:
   * **Problema**: Usuarios comunes pueden acceder a funciones de administración si descubren la URL.
   * **Mitigación**: Los endpoints están fuertemente protegidos por Role-Based Access Control (RBAC). Se utiliza `RequireRole("Admin", "Mecanico", "Conductor")` a nivel de endpoint para garantizar que solo usuarios con permisos adecuados realicen modificaciones.

4. **API7:2023 - Server Security Misconfiguration (Configuración Insegura del Servidor)**:
   * **Problema**: Configuraciones por defecto y mensajes de error detallados filtran información.
   * **Mitigación**: Se exige el uso del canal seguro mediante `app.UseHttpsRedirection()` y la validación de tokens JWT es estricta requiriendo Issuer, Audience y clave de firma secreta.

5. **API8:2023 - Security Misconfiguration (CORS Inseguro)**:
   * **Problema**: Un Cross-Origin Resource Sharing (CORS) con el valor `*` permite que cualquier sitio web consuma la API.
   * **Mitigación**: Se ha definido una política CORS restrictiva explícita llamada `"PermitirFrontend"`, que limita qué dominios exactos pueden realizar peticiones al backend (ej. localhost:3000 o dominios en producción verificados).