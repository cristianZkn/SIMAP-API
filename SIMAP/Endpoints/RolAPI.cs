using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;
public static class RolAPI {
    public static void MapRolApi(this WebApplication app) {
        var roles = app.MapGroup("/api/roles").WithTags("Roles");

        //api listar roles
        roles.MapGet("/", async (IRepositorio<Rol> repo) => {
            var lista = await repo.ObtenerTodosAsync();
            return Results.Ok(lista);
        });

        //api para crear un rol
        roles.MapPost("/", async (Rol r, IRepositorio<Rol> repo) =>
        {
            await repo.AgregarAsync(r);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/roles/{r.Id}", r);
        });

        //api buscar por id 
        roles.MapGet("/{id:int}", async (int id, IRepositorio<Rol> repo) =>
        {
            var rol = await repo.ObtenerPorIdAsync(id);
            return rol is null ? Results.NotFound() : Results.Ok(rol);
        });

        //api para editar por id
        roles.MapPut("/{id:int}", async (int id, Rol r, IRepositorio<Rol> repo) => {
            var rol = await repo.ObtenerPorIdAsync(id);
            if (rol is null) return Results.NotFound();

            rol.Nombre = r.Nombre;
            rol.Descripcion = r.Descripcion;
            
            await repo.ActualizarAsync(rol);
            await repo.GuardarCambiosAsync();
            return Results.Ok(rol);
        });

        //api para elimianr por id
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
