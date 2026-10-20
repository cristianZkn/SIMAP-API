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

        // [GET] /api/v1/bitacoras - Obtener todas las bitácoras (fallas reportadas) con vehículo incluido
        bitacoras.MapGet("/", async (IRepositorio<BitacoraFalla> repo) => {
            var lista = await repo.ObtenerConIncluidosAsync(b => b.Vehiculo);
            return Results.Ok(lista);
        });

        // [GET] /api/v1/bitacoras/{id} - Buscar una bitácora por su ID con vehículo incluido
        bitacoras.MapGet("/{id:int}", async (int id, IRepositorio<BitacoraFalla> repo) =>
        {
            var bitacora = await repo.ObtenerPorIdConIncluidosAsync(id, b => b.Vehiculo);
            return bitacora is null ? Results.NotFound() : Results.Ok(bitacora);
        });

        // [POST] /api/v1/bitacoras - Crear una nueva bitácora de falla (Admin y Conductor)
        bitacoras.MapPost("/", async (IRepositorio<BitacoraFalla> repo, [FromBody] BitacoraFalla nuevaBitacora) =>
        {
            // Limpiar propiedades de navegación e ID para evitar errores de Identity en la BD
            nuevaBitacora.Id = 0;
            nuevaBitacora.Vehiculo = null;
            nuevaBitacora.Usuario = null;

            if (string.IsNullOrWhiteSpace(nuevaBitacora.Descripcion) || string.IsNullOrWhiteSpace(nuevaBitacora.Prioridad) || string.IsNullOrWhiteSpace(nuevaBitacora.EstadoFalla))
                return Results.BadRequest("La Descripción, Prioridad y Estado son obligatorios.");

            await repo.AgregarAsync(nuevaBitacora);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/v1/bitacoras/{nuevaBitacora.Id}", nuevaBitacora);
        }).RequireAuthorization(policy => policy.RequireRole("Admin", "Conductor"));

        // [PUT] /api/v1/bitacoras/{id} - Actualizar bitácora (Admin completo, Mecánico solo estado)
        bitacoras.MapPut("/{id:int}", async (IRepositorio<BitacoraFalla> repo, int id, [FromBody] BitacoraFalla bitacoraActualizada, System.Security.Claims.ClaimsPrincipal user) =>
        {
            var bitacora = await repo.ObtenerPorIdAsync(id);
            if (bitacora == null)
                return Results.NotFound("Bitácora no encontrada");

            var esSoloMecanico = user.IsInRole("Mecanico") && !user.IsInRole("Admin");
            if (esSoloMecanico)
            {
                // El mecánico SOLO puede modificar el estado de la falla (pendiente, en revisión, resuelta)
                if (string.IsNullOrWhiteSpace(bitacoraActualizada.EstadoFalla))
                    return Results.BadRequest("El Estado es obligatorio.");

                bitacora.EstadoFalla = bitacoraActualizada.EstadoFalla;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(bitacoraActualizada.Descripcion) || string.IsNullOrWhiteSpace(bitacoraActualizada.Prioridad) || string.IsNullOrWhiteSpace(bitacoraActualizada.EstadoFalla))
                    return Results.BadRequest("La Descripción, Prioridad y Estado son obligatorios.");

                bitacora.VehiculoId = bitacoraActualizada.VehiculoId;
                bitacora.UsuarioId = bitacoraActualizada.UsuarioId;
                bitacora.FechaReporte = bitacoraActualizada.FechaReporte;
                bitacora.Descripcion = bitacoraActualizada.Descripcion;
                bitacora.Prioridad = bitacoraActualizada.Prioridad;
                bitacora.EstadoFalla = bitacoraActualizada.EstadoFalla;
            }

            await repo.ActualizarAsync(bitacora);
            await repo.GuardarCambiosAsync();
            return Results.Ok(bitacora);
        }).RequireAuthorization(policy => policy.RequireRole("Admin", "Mecanico"));

        // [DELETE] /api/v1/bitacoras/{id} - Eliminar una bitácora por ID (solo Admin)
        bitacoras.MapDelete("/{id:int}", async (IRepositorio<BitacoraFalla> repo, int id) =>
        {
            var bitacora = await repo.ObtenerPorIdAsync(id);
            if (bitacora == null)
                return Results.NotFound("Bitácora no encontrada");

            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.Ok("Bitácora eliminada correctamente");
        }).RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
