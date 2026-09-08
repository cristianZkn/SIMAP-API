using SIMAP.Models;
using Microsoft.EntityFrameworkCore;
using SIMAP.Services;
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
            usuarios.MapGet("/", async (AppDbContext db) => {
                var lista = await db.Usuarios.Include(u => u.Rol).ToListAsync();
                return Results.Ok(lista);
            });

            //api buscar por id 
            usuarios.MapGet("/{id:int}", async (int id, AppDbContext db) =>
            {
                var usuario = await db.Usuarios.Include(u => u.Rol).FirstOrDefaultAsync(u => u.Id == id);
                return usuario is null ? Results.NotFound() : Results.Ok(usuario);
            });

            //api para crear un usuario (Admin, adicional al registro)
            usuarios.MapPost("/", async (Usuario u, AppDbContext db, AuthService auth) =>
            {
                // Si la contraseña viene en texto plano, asumiendo que lo pasan en PasswordHash por simplificar o usan /registro
                u.PasswordHash = auth.HashPassword(u, u.PasswordHash);
                db.Usuarios.Add(u);
                await db.SaveChangesAsync();
                return Results.Created($"/api/usuarios/{u.Id}", u);
            });

            //api para editar por id
            usuarios.MapPut("/{id:int}", async (int id, Usuario u, AppDbContext db, AuthService auth) => {
                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario is null) return Results.NotFound();

                usuario.Nombre = u.Nombre;
                usuario.Email = u.Email;
                usuario.RolId = u.RolId;
                // Si deciden actualizar contraseña
                if (!string.IsNullOrEmpty(u.PasswordHash))
                {
                    usuario.PasswordHash = auth.HashPassword(usuario, u.PasswordHash);
                }
                
                await db.SaveChangesAsync();
                return Results.Ok(usuario);
            });

            //api para elimianr por id
            usuarios.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
            {
                var usuario = await db.Usuarios.FindAsync(id);
                if (usuario is null) return Results.NotFound();
                
                db.Usuarios.Remove(usuario);
                await db.SaveChangesAsync();
                return Results.NoContent();
            });

            // Registro público / login
            usuarios.MapPost("/registro", async (Usuario usuario, string password, 
                AppDbContext db, AuthService auth) =>
            {
                usuario.PasswordHash = auth.HashPassword(usuario, password);
                db.Usuarios.Add(usuario);
                await db.SaveChangesAsync();
                return Results.Created($"/api/usuarios/{usuario.Id}", usuario);
            });

            usuarios.MapPost("/login", async (LoginRequest login, AppDbContext db, 
                IConfiguration config, AuthService auth) =>
            {
                var usuario = await db.Usuarios.Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.Email == login.Email);

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
