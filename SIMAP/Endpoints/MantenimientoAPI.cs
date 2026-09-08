using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Services;

namespace SIMAP.Endpoints;
public static class MantenimientoAPI {
    public static void MapMantenimientoApi(this WebApplication app) {
        var group = app.MapGroup("/api/mantenimientos").WithTags("Mantenimientos");

        group.MapGet("/", async (AppDbContext db) => {
            return await db.Mantenimientos.ToListAsync();
        });

        group.MapGet("/{id}", async (int id, AppDbContext db) => {
            return await db.Mantenimientos.FindAsync(id)
                is Mantenimiento mantenimiento
                    ? Results.Ok(mantenimiento)
                    : Results.NotFound();
        });

        group.MapPost("/", async (Mantenimiento mantenimiento, AppDbContext db) => {
            db.Mantenimientos.Add(mantenimiento);
            await db.SaveChangesAsync();
            return Results.Created($"/api/mantenimientos/{mantenimiento.Id}", mantenimiento);
        });
    }
}
