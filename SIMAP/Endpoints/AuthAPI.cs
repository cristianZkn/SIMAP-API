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
            var auth = app.MapGroup("/api/v1/auth").WithTags("Autenticación");

            // Registro público
            auth.MapPost("/registro", async (Usuario usuario, string password, 
                IRepositorio<Usuario> repo, AuthService authService) =>
            {
                usuario.PasswordHash = authService.HashPassword(usuario, password);
                await repo.AgregarAsync(usuario);
                await repo.GuardarCambiosAsync();
                return Results.Created($"/api/v1/usuarios/{usuario.Id}", usuario);
            }).AllowAnonymous();

            // Login público
            auth.MapPost("/login", async (LoginRequest login, IRepositorio<Usuario> repo, 
                IConfiguration config, AuthService authService) =>
            {
                var todos = await repo.ObtenerConIncluidosAsync(u => u.Rol);
                var usuario = todos.FirstOrDefault(u => u.Email == login.Email);

                if (usuario is null)
                    return Results.Unauthorized();
                
                var verify = authService.VerifyPassword(usuario, login.Password);
                if (verify == Microsoft.AspNetCore.Identity.PasswordVerificationResult.Failed)
                    return Results.Unauthorized();

                var rolNombre = usuario.Rol?.Nombre ?? "Usuario";

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, usuario.Nombre),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim(ClaimTypes.Role, rolNombre)
                };

                var jwtKey = config["Jwt:Key"] ?? "ClaveSecretaMuyLargaParaDesarrollo12345!";
                var jwtIssuer = config["Jwt:Issuer"];
                var jwtAudience = config["Jwt:Audience"];
                var jwtExpireMinutes = config["Jwt:ExpireMinutes"] ?? "60";

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
                var credenciales = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                        issuer: jwtIssuer,
                        audience: jwtAudience,
                        claims: claims,
                        expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtExpireMinutes)),
                        signingCredentials: credenciales
                    );
                return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
            }).AllowAnonymous();
        }
        
        record LoginRequest(string Email, string Password);
    }
}
