using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;
public static class MantenimientoAPI {
    public static void MapMantenimientoApi(this WebApplication app) {
        var group = app.MapGroup("/api/mantenimientos").WithTags("Mantenimientos");

        group.MapGet("/", async (IRepositorio<Mantenimiento> repo) => {
            return await repo.ObtenerTodosAsync();
        });

        group.MapGet("/{id}", async (int id, IRepositorio<Mantenimiento> repo) => {
            return await repo.ObtenerPorIdAsync(id)
                is Mantenimiento mantenimiento
                    ? Results.Ok(mantenimiento)
                    : Results.NotFound();
        });

        group.MapPost("/", async (Mantenimiento mantenimiento, IRepositorio<Mantenimiento> repo) => {
            await repo.AgregarAsync(mantenimiento);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/mantenimientos/{mantenimiento.Id}", mantenimiento);
        });
        
        group.MapPut("/{id}", async (int id, Mantenimiento m, IRepositorio<Mantenimiento> repo) => {
            var mantenimiento = await repo.ObtenerPorIdAsync(id);
            if (mantenimiento is null) return Results.NotFound();

            mantenimiento.VehiculoId = m.VehiculoId;
            mantenimiento.FallaId = m.FallaId;
            mantenimiento.Tipo = m.Tipo;
            mantenimiento.FechaProgramada = m.FechaProgramada;
            mantenimiento.Costo = m.Costo;
            mantenimiento.TallerResponsable = m.TallerResponsable;
            mantenimiento.Estado = m.Estado;

            await repo.ActualizarAsync(mantenimiento);
            await repo.GuardarCambiosAsync();
            return Results.Ok(mantenimiento);
        });

        group.MapDelete("/{id}", async (int id, IRepositorio<Mantenimiento> repo) => {
            var mantenimiento = await repo.ObtenerPorIdAsync(id);
            if (mantenimiento is null) return Results.NotFound();

            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.NoContent();
        });
    }
}
