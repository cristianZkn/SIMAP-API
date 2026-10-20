using Microsoft.EntityFrameworkCore;
using SIMAP.Models;
using SIMAP.Repositorios;

namespace SIMAP.Endpoints;
public static class VehiculoAPI {
    public static void MapVehiculoApi(this WebApplication app) {
        var vehiculos = app.MapGroup("/api/v1/vehiculos")
            .WithTags("Vehiculos")
            .RequireAuthorization(policy => policy.RequireRole("Admin", "Mecanico", "Conductor"));

        // [GET] /api/v1/vehiculos - Obtiene la lista completa de vehículos (visible para todos los roles para reporte de fallas)
        vehiculos.MapGet("/", async (IRepositorio<Vehiculo> repo) => {
            var lista = await repo.ObtenerTodosAsync();
            return Results.Ok(lista);
        });

        // [POST] /api/v1/vehiculos - Crea un nuevo vehículo (solo Admin)
        vehiculos.MapPost("/", async (Vehiculo v, IRepositorio<Vehiculo> repo) =>
        {
            if (string.IsNullOrWhiteSpace(v.Placa) || string.IsNullOrWhiteSpace(v.Marca) || string.IsNullOrWhiteSpace(v.Modelo) || string.IsNullOrWhiteSpace(v.Estado))
                return Results.BadRequest("Placa, Marca, Modelo y Estado son obligatorios.");
            if (v.Anio <= 0 || v.Kilometraje < 0)
                return Results.BadRequest("El Año y Kilometraje deben ser valores válidos.");

            await repo.AgregarAsync(v);
            await repo.GuardarCambiosAsync(); // Confirmamos los cambios en la BD
            return Results.Created($"/api/v1/vehiculos/{v.Id}", v);
        }).RequireAuthorization(policy => policy.RequireRole("Admin"));

        // [GET] /api/v1/vehiculos/{id} - Busca un vehículo específico por su ID
        vehiculos.MapGet("/{id:int}", async (int id, IRepositorio<Vehiculo> repo) =>
        {
            var vehiculo = await repo.ObtenerPorIdAsync(id);
            // Retorna 404 Not Found si no existe, o 200 OK si lo encuentra
            return vehiculo is null ? Results.NotFound() : Results.Ok(vehiculo);
        });

        // [PUT] /api/v1/vehiculos/{id} - Modifica por completo un vehículo existente (solo Admin)
        vehiculos.MapPut("/{id:int}", async (int id, Vehiculo v, IRepositorio<Vehiculo> repo) => {
            if (string.IsNullOrWhiteSpace(v.Placa) || string.IsNullOrWhiteSpace(v.Marca) || string.IsNullOrWhiteSpace(v.Modelo) || string.IsNullOrWhiteSpace(v.Estado))
                return Results.BadRequest("Placa, Marca, Modelo y Estado son obligatorios.");
            if (v.Anio <= 0 || v.Kilometraje < 0)
                return Results.BadRequest("El Año y Kilometraje deben ser valores válidos.");

            var vehiculo = await repo.ObtenerPorIdAsync(id);
            if (vehiculo is null) return Results.NotFound();

            // Mapeo manual de propiedades actualizadas
            vehiculo.Placa = v.Placa;
            vehiculo.Marca = v.Marca;
            vehiculo.Modelo = v.Modelo;
            vehiculo.Anio = v.Anio;
            vehiculo.Kilometraje = v.Kilometraje;
            vehiculo.Estado = v.Estado;
            
            await repo.ActualizarAsync(vehiculo);
            await repo.GuardarCambiosAsync();
            return Results.Ok(vehiculo);
        }).RequireAuthorization(policy => policy.RequireRole("Admin"));

        // [DELETE] /api/v1/vehiculos/{id} - Elimina un vehículo por su ID (solo Admin)
        vehiculos.MapDelete("/{id:int}", async (int id, IRepositorio<Vehiculo> repo) =>
        {
            var vehiculo = await repo.ObtenerPorIdAsync(id);
            if (vehiculo is null) return Results.NotFound();
            
            await repo.EliminarAsync(id);
            await repo.GuardarCambiosAsync();
            return Results.NoContent(); // 204 No Content indica éxito sin retornar datos
        }).RequireAuthorization(policy => policy.RequireRole("Admin"));
    }
}
