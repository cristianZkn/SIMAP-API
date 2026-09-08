using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;
public static class VehiculoAPI {
    public static void MapVehiculoApi(this WebApplication app) {
        var vehiculos = app.MapGroup("/api/vehiculos").WithTags("Vehiculos");

        //api listar vehiculos
        vehiculos.MapGet("/", async (IRepositorio<Vehiculo> repo) => {
            var lista = await repo.ObtenerTodosAsync();
            return Results.Ok(lista);
        });

        //api para crear un vehiculo
        vehiculos.MapPost("/", async (Vehiculo v, IRepositorio<Vehiculo> repo) =>
        {
            await repo.AgregarAsync(v);
            await repo.GuardarCambiosAsync();
            return Results.Created($"/api/vehiculos/{v.Id}", v);
        });

        //api buscar por id 
        vehiculos.MapGet("/{id:int}", async (int id, IRepositorio<Vehiculo> repo) =>
        {
            var vehiculo = await repo.ObtenerPorIdAsync(id);
            return vehiculo is null ? Results.NotFound() : Results.Ok(vehiculo);
        });

        //api para editar por id
        vehiculos.MapPut("/{id:int}", async (int id, Vehiculo v, IRepositorio<Vehiculo> repo) => {
            var vehiculo = await repo.ObtenerPorIdAsync(id);
            if (vehiculo is null) return Results.NotFound();

            vehiculo.Placa = v.Placa;
            vehiculo.Marca = v.Marca;
            vehiculo.Modelo = v.Modelo;
            vehiculo.Anio = v.Anio;
            vehiculo.Kilometraje = v.Kilometraje;
            vehiculo.Estado = v.Estado;
            
            await repo.ActualizarAsync(vehiculo);
            await repo.GuardarCambiosAsync();
            return Results.Ok(vehiculo);
        });

        //api para elimianr por id
        vehiculos.MapDelete("/{id:int}", async (int id, IRepositorio<Vehiculo> repo) =>
        {
            var vehiculo = await repo.ObtenerPorIdAsync(id);
            if (vehiculo is null) return Results.NotFound();
            
            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.NoContent();
        });
    }
}
