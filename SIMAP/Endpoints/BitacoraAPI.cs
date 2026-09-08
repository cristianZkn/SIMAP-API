using Microsoft.AspNetCore.Mvc;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;

public static class BitacoraAPI
{
    public static void MapBitacoraAPI(this WebApplication app)
    {
        var bitacoras = app.MapGroup("/api/v1/bitacoras")
            .WithTags("Bitácora de fallas")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mecanico", "Conductor"));

        // [GET] /api/v1/bitacoras - Obtener todas las bitácoras (fallas reportadas)
        bitacoras.MapGet("/", async (IRepositorio<BitacoraFalla> repo) => {
            var lista = await repo.ObtenerTodosAsync();
            return Results.Ok(lista);
        });

        // [GET] /api/v1/bitacoras/{id} - Buscar una bitácora por su ID
        bitacoras.MapGet("/{id}", async (IRepositorio<BitacoraFalla> repo, int id) =>
        {
            var bitacora = await repo.ObtenerPorIdAsync(id);
            return bitacora is null ? Results.NotFound() : Results.Ok(bitacora);
        });

        // [POST] /api/v1/bitacoras - Crear una nueva bitácora de falla
        bitacoras.MapPost("/", async (IRepositorio<BitacoraFalla> repo, [FromBody] BitacoraFalla nuevaBitacora) =>
        {
            await repo.AgregarAsync(nuevaBitacora);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/v1/bitacoras/{nuevaBitacora.Id}", nuevaBitacora);
        });

        // [PUT] /api/v1/bitacoras/{id} - Actualizar la información de una bitácora
        bitacoras.MapPut("/{id}", async (IRepositorio<BitacoraFalla> repo, int id, [FromBody] BitacoraFalla bitacoraActualizada) =>
        {
            var bitacora = await repo.ObtenerPorIdAsync(id);
            if (bitacora == null)
                return Results.NotFound("Bitácora no encontrada");

            bitacora.VehiculoId = bitacoraActualizada.VehiculoId;
            bitacora.UsuarioId = bitacoraActualizada.UsuarioId;
            bitacora.FechaReporte = bitacoraActualizada.FechaReporte;
            bitacora.Descripcion = bitacoraActualizada.Descripcion;
            bitacora.Prioridad = bitacoraActualizada.Prioridad;
            bitacora.EstadoFalla = bitacoraActualizada.EstadoFalla;

            await repo.ActualizarAsync(bitacora);
            await repo.GuardarCambiosAsync();
            return Results.Ok(bitacora);
        });

        // [DELETE] /api/v1/bitacoras/{id} - Eliminar una bitácora por ID
        bitacoras.MapDelete("/{id}", async (IRepositorio<BitacoraFalla> repo, int id) =>
        {
            var bitacora = await repo.ObtenerPorIdAsync(id);
            if (bitacora == null)
                return Results.NotFound("Bitácora no encontrada");

            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.Ok("Bitácora eliminada correctamente");
        });
    }
}
