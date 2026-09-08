using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Services;

namespace SIMAP.Endpoints;
public static class VehiculoAPI {
    public static void MapVehiculoApi(this WebApplication app) {
        var vehiculos = app.MapGroup("/api/vehiculos").WithTags("Vehiculos");

        //api listar vehiculos
        vehiculos.MapGet("/", async (AppDbContext db) => {
            var lista = await db.Vehiculos.ToListAsync();
            return Results.Ok(lista);
        });

        //api para crear un vehiculo
        vehiculos.MapPost("/", async (Vehiculo v, AppDbContext db) =>
        {
            db.Vehiculos.Add(v);
            await db.SaveChangesAsync();
            return Results.Created($"/api/vehiculos/{v.Id}", v);
        }); // Opcional: .RequireAuthorization()

        //api buscar por id 
        vehiculos.MapGet("/{id:int}", async (int id, AppDbContext db) =>
        {
            var vehiculo = await db.Vehiculos.FindAsync(id);
            return vehiculo is null ? Results.NotFound() : Results.Ok(vehiculo);
        });

        //api para editar por id
        vehiculos.MapPut("/{id:int}", async (int id, Vehiculo v, AppDbContext db) => {
            var vehiculo = await db.Vehiculos.FindAsync(id);
            if (vehiculo is null) return Results.NotFound();

            vehiculo.Placa = v.Placa;
            vehiculo.Marca = v.Marca;
            vehiculo.Modelo = v.Modelo;
            vehiculo.Anio = v.Anio;
            vehiculo.Kilometraje = v.Kilometraje;
            vehiculo.Estado = v.Estado;
            
            await db.SaveChangesAsync();
            return Results.Ok(vehiculo);
        });

        //api para elimianr por id
        vehiculos.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
        {
            var vehiculo = await db.Vehiculos.FindAsync(id);
            if (vehiculo is null) return Results.NotFound();
            
            db.Vehiculos.Remove(vehiculo);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
