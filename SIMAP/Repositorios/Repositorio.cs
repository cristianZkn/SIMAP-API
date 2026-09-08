using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using SIMAP.Services;

namespace SIMAP.Repositorios;

public class Repositorio<T> : IRepositorio<T> where T : class
{
    // El AppDbContext representa la sesión con la base de datos
    private readonly AppDbContext _contexto;
    // El DbSet representa a la tabla específica en la que el repositorio operará (Ej: Vehiculos)
    private readonly DbSet<T> _dbSet;

    public Repositorio(AppDbContext contexto)
    {
        _contexto = contexto;
        _dbSet = contexto.Set<T>();
    }

    // --- MÉTODOS CRUD BÁSICOS ---

    // Obtiene absolutamente todos los registros de la tabla
    public async Task<IEnumerable<T>> ObtenerTodosAsync()
    {
        return await _dbSet.ToListAsync();
    }

    // Busca un registro específico utilizando su clave primaria (ID)
    public async Task<T?> ObtenerPorIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    // Prepara una entidad para ser insertada en la base de datos
    public async Task AgregarAsync(T entidad)
    {
        await _dbSet.AddAsync(entidad);
    }

    // Marca una entidad como "Modificada" para que al guardar cambie en la BD
    public Task ActualizarAsync(T entidad)
    {
        _dbSet.Update(entidad);
        return Task.CompletedTask; // Task.CompletedTask porque Update no es asíncrono
    }

    // Busca un registro y, si existe, lo marca para ser eliminado
    public async Task EliminarAsync(int id)
    {
        var entidad = await _dbSet.FindAsync(id);
        if (entidad != null)
        {
            _dbSet.Remove(entidad);
        }
    }

    // Ejecuta la transacción final: todos los Adds, Updates o Removes pendientes se guardan
    public async Task GuardarCambiosAsync()
    {
        await _contexto.SaveChangesAsync();
    }

    // --- MÉTODOS AVANZADOS ---

    // Permite hacer un "JOIN" dinámico (Include) para cargar datos relacionales (ej: Usuario con su Rol)
    public async Task<IEnumerable<T>> ObtenerConIncluidosAsync(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        return await query.ToListAsync();
    }

    // Igual que el anterior, pero filtrando por el ID de la entidad principal
    public async Task<T?> ObtenerPorIdConIncluidosAsync(int id, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        
        // Buscamos dinámicamente cuál es el nombre de la propiedad que actúa como Clave Primaria (usualmente 'Id')
        var keyProperty = _contexto.Model.FindEntityType(typeof(T))?.FindPrimaryKey()?.Properties.FirstOrDefault();
        if (keyProperty == null) return null;

        // Armamos un query que sea equivalente a: WHERE Id == id
        return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, keyProperty.Name) == id);
    }
}
