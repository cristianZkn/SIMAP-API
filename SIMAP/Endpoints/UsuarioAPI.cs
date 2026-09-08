using SIMAP.Models;
using Microsoft.EntityFrameworkCore;
using SIMAP.Services;
using SIMAP.Repositorios;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;

namespace SIMAP.Endpoints
{
    public static class UsuarioApi
    {
        public static void MapUsuarioApi(this WebApplication app)
        {
            var usuarios = app.MapGroup("/api/usuarios").WithTags("Usuarios");

            //api listar usuarios
            usuarios.MapGet("/", async (IRepositorio<Usuario> repo) => {
                var lista = await repo.ObtenerConIncluidosAsync(u => u.Rol);
                return Results.Ok(lista);
            });

            //api buscar por id 
            usuarios.MapGet("/{id:int}", async (int id, IRepositorio<Usuario> repo) =>
            {
                var usuario = await repo.ObtenerPorIdConIncluidosAsync(id, u => u.Rol);
                return usuario is null ? Results.NotFound() : Results.Ok(usuario);
            });

            //api para crear un usuario (Admin, adicional al registro)
            usuarios.MapPost("/", async (Usuario u, IRepositorio<Usuario> repo, AuthService auth) =>
            {
                u.PasswordHash = auth.HashPassword(u, u.PasswordHash);
                await repo.AgregarAsync(u);
                await repo.GuardarCambiosAsync();
                return Results.Created($"/api/usuarios/{u.Id}", u);
            });

            //api para editar por id
            usuarios.MapPut("/{id:int}", async (int id, Usuario u, IRepositorio<Usuario> repo, AuthService auth) => {
                var usuario = await repo.ObtenerPorIdAsync(id);
                if (usuario is null) return Results.NotFound();

                usuario.Nombre = u.Nombre;
                usuario.Email = u.Email;
                usuario.RolId = u.RolId;
                if (!string.IsNullOrEmpty(u.PasswordHash))
                {
                    usuario.PasswordHash = auth.HashPassword(usuario, u.PasswordHash);
                }
                
                await repo.ActualizarAsync(usuario);
                await repo.GuardarCambiosAsync();
                return Results.Ok(usuario);
            });

            //api para elimianr por id
            usuarios.MapDelete("/{id:int}", async (int id, IRepositorio<Usuario> repo) =>
            {
                var usuario = await repo.ObtenerPorIdAsync(id);
                if (usuario is null) return Results.NotFound();
                
                await repo.EliminarAsync(id);
                await repo.GuardarCambiosAsync();
                return Results.NoContent();
            });

            // Registro público / login
            usuarios.MapPost("/registro", async (Usuario usuario, string password, 
                IRepositorio<Usuario> repo, AuthService auth) =>
            {
                usuario.PasswordHash = auth.HashPassword(usuario, password);
                await repo.AgregarAsync(usuario);
                await repo.GuardarCambiosAsync();
                return Results.Created($"/api/usuarios/{usuario.Id}", usuario);
            });

            usuarios.MapPost("/login", async (LoginRequest login, IRepositorio<Usuario> repo, 
                IConfiguration config, AuthService auth) =>
            {
                // Aquí usamos LINQ sobre la lista en memoria (al usar ObtenerConIncluidosAsync retorna todos).
                // Para una DB grande deberíamos crear un método específico en el repositorio: ObtenerPorEmailAsync.
                // Como es genérico, filtramos en memoria por ahora.
                var todos = await repo.ObtenerConIncluidosAsync(u => u.Rol);
                var usuario = todos.FirstOrDefault(u => u.Email == login.Email);

                if (usuario is null)
                    return Results.Unauthorized();
                
                var verify = auth.VerifyPassword(usuario, login.Password);
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
            });
        }
        record LoginRequest(string Email, string Password);
    }
}
