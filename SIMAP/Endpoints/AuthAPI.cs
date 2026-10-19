using SIMAP.Models;
using SIMAP.Repositorios;
using SIMAP.Services;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace SIMAP.Endpoints
{
    public static class AuthAPI
    {
        public static void MapAuthApi(this WebApplication app)
        {
            // Agrupamos bajo una ruta específica y documentamos con Swagger/Scalar
            var auth = app.MapGroup("/api/v1/auth").WithTags("Autenticación");

            // --- ENDPOINT: Registro de nuevo usuario ---
            // La contraseña llega en el body JSON (no en query string) para evitar que quede
            // expuesta en los logs del servidor, historial del browser o cabeceras de red.
            auth.MapPost("/registro", async (RegistroRequest request,
                IRepositorio<Usuario> repo, AuthService authService) =>
            {
                // Validación básica: todos los campos son obligatorios
                if (string.IsNullOrWhiteSpace(request.Nombre) ||
                    string.IsNullOrWhiteSpace(request.Email) ||
                    string.IsNullOrWhiteSpace(request.Password))
                    return Results.BadRequest("El Nombre, Email y Contraseña son obligatorios y no pueden estar en blanco.");

                // Construimos el usuario con Id=0 para que SQL Server genere el ID (IDENTITY)
                var usuario = new Usuario
                {
                    Id = 0,
                    Nombre = request.Nombre,
                    Email = request.Email,
                    RolId = request.RolId,
                    Rol = null // No insertamos el objeto navegación, solo la FK
                };
                // Hasheamos la contraseña antes de guardarla (OWASP Broken Authentication)
                usuario.PasswordHash = authService.HashPassword(usuario, request.Password);

                await repo.AgregarAsync(usuario);
                await repo.GuardarCambiosAsync();

                // Retornamos DTO sin passwordHash (OWASP API3 — no exponer datos sensibles)
                return Results.Created($"/api/v1/usuarios/{usuario.Id}", new UsuarioDto(usuario));
            }).AllowAnonymous();

            // --- ENDPOINT: Inicio de sesión (Login) ---
            auth.MapPost("/login", async (LoginRequest login, IRepositorio<Usuario> repo,
                IConfiguration config, AuthService authService) =>
            {
                // Buscamos a todos los usuarios, incluyendo sus roles, y filtramos por email
                var todos = await repo.ObtenerConIncluidosAsync(u => u.Rol);
                var usuario = todos.FirstOrDefault(u => u.Email == login.Email);

                // Si el usuario no existe, rechazamos la petición
                if (usuario is null)
                    return Results.Unauthorized();

                // Verificamos que la contraseña enviada coincida con el hash almacenado en la DB
                var verify = authService.VerifyPassword(usuario, login.Password);
                if (verify == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
                    return Results.Unauthorized();

                // Obtenemos el nombre del rol del usuario (por defecto "Usuario" si no tiene uno asignado)
                var rolNombre = usuario.Rol?.Nombre ?? "Usuario";

                // --- CREACIÓN DEL JWT (JSON Web Token) ---

                // 1. Definimos los "Claims" (piezas de información que viajan encriptadas dentro del token)
                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, usuario.Nombre),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim(ClaimTypes.Role, rolNombre) // El rol es vital para la autorización
                };

                // 2. Extraemos las configuraciones del JWT del archivo appsettings.json
                var jwtKey = config["Jwt:Key"] ?? "ClaveSecretaMuyLargaParaDesarrollo12345!";
                var jwtIssuer = config["Jwt:Issuer"];
                var jwtAudience = config["Jwt:Audience"];
                var jwtExpireMinutes = config["Jwt:ExpireMinutes"] ?? "60";

                // 3. Creamos la llave de seguridad usando un algoritmo fuerte (HmacSha256)
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var credenciales = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                // 4. Armamos el token con su expiración, claims y firmas
                var token = new JwtSecurityToken(
                        issuer: jwtIssuer,
                        audience: jwtAudience,
                        claims: claims,
                        expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtExpireMinutes)),
                        signingCredentials: credenciales
                    );

                // 5. Retornamos el token y los datos públicos del usuario (sin passwordHash)
                return Results.Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    usuario = new UsuarioDto(usuario) // El frontend necesita saber nombre y rol
                });
            }).AllowAnonymous();
        }

        // --- DTOs (Data Transfer Objects) ---
        // Evitan exponer datos sensibles (passwordHash) en las respuestas de la API (OWASP API3)

        // Body del login: email y contraseña en texto plano (viajan sobre HTTPS)
        record LoginRequest(string Email, string Password);

        // Body del registro: todos los datos + contraseña en texto plano (en el body, no en la URL)
        record RegistroRequest(string Nombre, string Email, string Password, int RolId);

        // DTO de respuesta público: nunca incluye el hash de la contraseña
        public record UsuarioDto(int Id, string Nombre, string Email, int RolId, string? Rol)
        {
            // Constructor conveniente que convierte desde el modelo Entity Framework
            public UsuarioDto(Usuario u) : this(u.Id, u.Nombre, u.Email, u.RolId, u.Rol?.Nombre) { }
        }
    }
}
