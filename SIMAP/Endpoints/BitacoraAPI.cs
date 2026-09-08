using SIMAP.Models;
using SIMAP.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SIMAP.Endpoints;

public static class BitacoraAPI
{
    public static void MapBitacoraAPI(this WebApplication app)
    {
        var bitacoras = app.MapGroup("/api/bitacoras").WithTags("Bitácora de fallas");

        //API: Obtener todas las bitácoras
        bitacoras.MapGet("/", async (AppDbContext db) => {
            var lista = await db.BitacoraFallas.ToListAsync();
            return Results.Ok(lista);
        });

        //API: buscar una bitácora por ID
        bitacoras.MapGet("/{id}", async (AppDbContext db, int id) =>
        {
            var bitacora = await db.BitacoraFallas.FindAsync(id);
            return Results.Ok(bitacora);
        });

        //API: Crear una nueva bitácora
        bitacoras.MapPost("/", async (AppDbContext db, [FromBody] BitacoraFalla nuevaBitacora) =>
        {
            db.BitacoraFallas.Add(nuevaBitacora);
            await db.SaveChangesAsync();
            return Results.Created($"/api/bitacoras/{nuevaBitacora.Id}", nuevaBitacora);
        });

        // PUT: Actualizar una bitácora
        bitacoras.MapPut("/{id}", async ([FromServices] AppDbContext context, int id, [FromBody] BitacoraFalla bitacoraActualizada) =>
        {
            var bitacora = await context.BitacoraFallas.FindAsync(id);
            if (bitacora == null)
                return Results.NotFound("Bitácora no encontrada");

            bitacora.VehiculoId = bitacoraActualizada.VehiculoId;
            bitacora.UsuarioId = bitacoraActualizada.UsuarioId;
            bitacora.FechaReporte = bitacoraActualizada.FechaReporte;
            bitacora.Descripcion = bitacoraActualizada.Descripcion;
            bitacora.Prioridad = bitacoraActualizada.Prioridad;
            bitacora.EstadoFalla = bitacoraActualizada.EstadoFalla;

            await context.SaveChangesAsync();
            return Results.Ok(bitacora);
        });

        // DELETE: Eliminar una bitácora
        bitacoras.MapDelete("/{id}", async ([FromServices] AppDbContext context, int id) =>
        {
            var bitacora = await context.BitacoraFallas.FindAsync(id);
            if (bitacora == null)
                return Results.NotFound("Bitácora no encontrada");

            context.BitacoraFallas.Remove(bitacora);
            await context.SaveChangesAsync();
            return Results.Ok("Bitácora eliminada correctamente");
        });
    }
}
