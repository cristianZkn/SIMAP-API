using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Services;

namespace SIMAP.Endpoints;
public static class RolAPI {
    public static void MapRolApi(this WebApplication app) {
        var roles = app.MapGroup("/api/roles").WithTags("Roles");

        //api listar roles
        roles.MapGet("/", async (AppDbContext db) => {
            var lista = await db.Roles.ToListAsync();
            return Results.Ok(lista);
        });

        //api para crear un rol
        roles.MapPost("/", async (Rol r, AppDbContext db) =>
        {
            db.Roles.Add(r);
            await db.SaveChangesAsync();
            return Results.Created($"/api/roles/{r.Id}", r);
        });

        //api buscar por id 
        roles.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var rol = await db.Roles.FindAsync(id);
            return rol is null ? Results.NotFound() : Results.Ok(rol);
        });

        //api para editar por id
        roles.MapPut("/{id:int}", async (int id, Rol r, AppDbContext db) => {
            var rol = await db.Roles.FindAsync(id);
            if (rol is null) return Results.NotFound();

            rol.Nombre = r.Nombre;
            rol.Descripcion = r.Descripcion;
            
            await db.SaveChangesAsync();
            return Results.Ok(rol);
        });

        //api para elimianr por id
        roles.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var rol = await db.Roles.FindAsync(id);
            if (rol is null) return Results.NotFound();
            
            db.Roles.Remove(rol);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
