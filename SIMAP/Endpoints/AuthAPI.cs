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
            auth.MapPost("/registro", async (Usuario usuario, string password, 
                IRepositorio<Usuario> repo, AuthService authService) =>
            {
                // Validación básica de datos
                if (string.IsNullOrWhiteSpace(usuario.Nombre) || string.IsNullOrWhiteSpace(usuario.Email) || string.IsNullOrWhiteSpace(password))
                    return Results.BadRequest("El Nombre, Email y Contraseña son obligatorios y no pueden estar en blanco.");

                // Limpia propiedades que no deben insertarse explícitamente
                usuario.Id = 0;
                usuario.Rol = null;

                // Hasheamos la contraseña antes de guardarla en la BD (Mitigación de OWASP Broken Authentication)
                usuario.PasswordHash = authService.HashPassword(usuario, password);
                
                // Usamos el patrón repositorio para aislar el acceso a la base de datos
                await repo.AgregarAsync(usuario);
                await repo.GuardarCambiosAsync();
                
                return Results.Created($"/api/v1/usuarios/{usuario.Id}", usuario);
            }).AllowAnonymous(); // Permitir el registro sin estar logueado

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
                    
                // 5. Retornamos el token como una cadena de texto lista para ser usada en los Headers HTTP
                return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
            }).AllowAnonymous(); // Permitir login sin token
        }
        
        record LoginRequest(string Email, string Password);
    }
}
