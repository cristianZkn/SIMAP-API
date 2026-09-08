using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;
public static class MantenimientoAPI {
    public static void MapMantenimientoApi(this WebApplication app) {
        var group = app.MapGroup("/api/v1/mantenimientos")
            .WithTags("Mantenimientos")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mecanico"));

        // [GET] /api/v1/mantenimientos - Obtiene todos los mantenimientos programados o realizados
        group.MapGet("/", async (IRepositorio<Mantenimiento> repo) => {
            return await repo.ObtenerTodosAsync();
        });

        // [GET] /api/v1/mantenimientos/{id} - Busca un mantenimiento específico
        group.MapGet("/{id}", async (int id, IRepositorio<Mantenimiento> repo) => {
            return await repo.ObtenerPorIdAsync(id)
                is Mantenimiento mantenimiento
                    ? Results.Ok(mantenimiento)
                    : Results.NotFound();
        });

        // [POST] /api/v1/mantenimientos - Registra un nuevo mantenimiento
        group.MapPost("/", async (Mantenimiento mantenimiento, IRepositorio<Mantenimiento> repo) => {
            if (string.IsNullOrWhiteSpace(mantenimiento.Tipo) || string.IsNullOrWhiteSpace(mantenimiento.Estado))
                return Results.BadRequest("El Tipo y Estado del mantenimiento son obligatorios.");

            await repo.AgregarAsync(mantenimiento);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/v1/mantenimientos/{mantenimiento.Id}", mantenimiento);
        });
        
        // [PUT] /api/v1/mantenimientos/{id} - Actualiza el estado o detalles de un mantenimiento
        group.MapPut("/{id}", async (int id, Mantenimiento m, IRepositorio<Mantenimiento> repo) => {
            if (string.IsNullOrWhiteSpace(m.Tipo) || string.IsNullOrWhiteSpace(m.Estado))
                return Results.BadRequest("El Tipo y Estado del mantenimiento son obligatorios.");

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

        // [DELETE] /api/v1/mantenimientos/{id} - Elimina un registro de mantenimiento
        group.MapDelete("/{id}", async (int id, IRepositorio<Mantenimiento> repo) => {
            var mantenimiento = await repo.ObtenerPorIdAsync(id);
            if (mantenimiento is null) return Results.NotFound();

            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.NoContent();
        });
    }
}
