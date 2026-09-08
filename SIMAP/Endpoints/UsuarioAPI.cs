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

        }
    }
}
