using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;
public static class RolAPI {
    public static void MapRolApi(this WebApplication app) {
        var roles = app.MapGroup("/api/v1/roles")
            .WithTags("Roles")
            .RequireAuthorization(policy => policy.RequireRole("Admin"));

        // [GET] /api/v1/roles - Obtiene todos los roles del sistema
        roles.MapGet("/", async (IRepositorio<Rol> repo) => {
            var lista = await repo.ObtenerTodosAsync();
            return Results.Ok(lista);
        });

        // [POST] /api/v1/roles - Crea un nuevo rol
        roles.MapPost("/", async (Rol r, IRepositorio<Rol> repo) =>
        {
            await repo.AgregarAsync(r);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/v1/roles/{r.Id}", r);
        });

        // [GET] /api/v1/roles/{id} - Busca un rol específico
        roles.MapGet("/{id:int}", async (int id, IRepositorio<Rol> repo) =>
        {
            var rol = await repo.ObtenerPorIdAsync(id);
            return rol is null ? Results.NotFound() : Results.Ok(rol);
        });

        // [PUT] /api/v1/roles/{id} - Actualiza un rol existente
        roles.MapPut("/{id:int}", async (int id, Rol r, IRepositorio<Rol> repo) => {
            var rol = await repo.ObtenerPorIdAsync(id);
            if (rol is null) return Results.NotFound();

            rol.Nombre = r.Nombre;
            rol.Descripcion = r.Descripcion;
            
            await repo.ActualizarAsync(rol);
            await repo.GuardarCambiosAsync();
            return Results.Ok(rol);
        });

        // [DELETE] /api/v1/roles/{id} - Elimina un rol
        roles.MapDelete("/{id:int}", async (int id, IRepositorio<Rol> repo) =>
        {
            var rol = await repo.ObtenerPorIdAsync(id);
            if (rol is null) return Results.NotFound();
            
            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.NoContent();
        });
    }
}
