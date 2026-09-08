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
            var usuarios = app.MapGroup("/api/v1/usuarios")
                .WithTags("Usuarios")
                .RequireAuthorization(policy => policy.RequireRole("Admin"));

            // [GET] /api/v1/usuarios - Obtiene todos los usuarios y sus roles asociados
            usuarios.MapGet("/", async (IRepositorio<Usuario> repo) => {
                var lista = await repo.ObtenerConIncluidosAsync(u => u.Rol);
                return Results.Ok(lista);
            });

            // [GET] /api/v1/usuarios/{id} - Busca un usuario específico e incluye su rol
            usuarios.MapGet("/{id:int}", async (int id, IRepositorio<Usuario> repo) =>
            {
                var usuario = await repo.ObtenerPorIdConIncluidosAsync(id, u => u.Rol);
                return usuario is null ? Results.NotFound() : Results.Ok(usuario);
            });

            // [POST] /api/v1/usuarios - (Uso interno de Admin) Crea un usuario directamente
            usuarios.MapPost("/", async (Usuario u, IRepositorio<Usuario> repo, AuthService auth) =>
            {
                // Hashea la contraseña antes de guardarla (obligatorio)
                u.PasswordHash = auth.HashPassword(u, u.PasswordHash);
                await repo.AgregarAsync(u);
                await repo.GuardarCambiosAsync();
                return Results.Created($"/api/v1/usuarios/{u.Id}", u);
            });

            // [PUT] /api/v1/usuarios/{id} - Actualiza datos básicos o contraseña de un usuario
            usuarios.MapPut("/{id:int}", async (int id, Usuario u, IRepositorio<Usuario> repo, AuthService auth) => {
                var usuario = await repo.ObtenerPorIdAsync(id);
                if (usuario is null) return Results.NotFound();

                usuario.Nombre = u.Nombre;
                usuario.Email = u.Email;
                usuario.RolId = u.RolId;
                
                // Si el Admin envió una nueva contraseña, la hasheamos; si no, dejamos la anterior
                if (!string.IsNullOrEmpty(u.PasswordHash))
                {
                    usuario.PasswordHash = auth.HashPassword(usuario, u.PasswordHash);
                }
                
                await repo.ActualizarAsync(usuario);
                await repo.GuardarCambiosAsync();
                return Results.Ok(usuario);
            });

            // [DELETE] /api/v1/usuarios/{id} - Elimina un usuario del sistema permanentemente
            usuarios.MapDelete("/{id:int}", async (int id, IRepositorio<Usuario> repo) =>
            {
                var usuario = await repo.ObtenerPorIdAsync(id);
                if (usuario is null) return Results.NotFound();
                
                await repo.EliminarAsync(id);
                await repo.GuardarCambiosAsync();
                return Results.NoContent();
            });
        }
    }
}
