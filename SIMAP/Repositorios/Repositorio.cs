using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using SIMAP.Services;

namespace SIMAP.Repositorios;

public class Repositorio<T> : IRepositorio<T> where T : class
{
    private readonly AppDbContext _contexto;
    private readonly DbSet<T> _dbSet;

    public Repositorio(AppDbContext contexto)
    {
        _contexto = contexto;
        _dbSet = contexto.Set<T>();
    }

    public async Task<IEnumerable<T>> ObtenerTodosAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public async Task<T?> ObtenerPorIdAsync(int id)
    {
        return await _dbSet.FindAsync(id);
    }

    public async Task AgregarAsync(T entidad)
    {
        await _dbSet.AddAsync(entidad);
    }

    public Task ActualizarAsync(T entidad)
    {
        _dbSet.Update(entidad);
        return Task.CompletedTask;
    }

    public async Task EliminarAsync(int id)
    {
        var entidad = await _dbSet.FindAsync(id);
        if (entidad != null)
        {
            _dbSet.Remove(entidad);
        }
    }

    public async Task GuardarCambiosAsync()
    {
        await _contexto.SaveChangesAsync();
    }

    public async Task<IEnumerable<T>> ObtenerConIncluidosAsync(params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        return await query.ToListAsync();
    }

    public async Task<T?> ObtenerPorIdConIncluidosAsync(int id, params Expression<Func<T, object>>[] includes)
    {
        IQueryable<T> query = _dbSet;
        foreach (var include in includes)
        {
            query = query.Include(include);
        }
        
        // Asume que la entidad tiene una propiedad 'Id'
        var keyProperty = _contexto.Model.FindEntityType(typeof(T))?.FindPrimaryKey()?.Properties.FirstOrDefault();
        if (keyProperty == null) return null;

        return await query.FirstOrDefaultAsync(e => EF.Property<int>(e, keyProperty.Name) == id);
    }
}
