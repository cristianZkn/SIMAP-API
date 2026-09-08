using System.Linq.Expressions;

namespace SIMAP.Repositorios;

public interface IRepositorio<T> where T : class
{
    Task<IEnumerable<T>> ObtenerTodosAsync();
    Task<T?> ObtenerPorIdAsync(int id);
    Task AgregarAsync(T entidad);
    Task ActualizarAsync(T entidad);
    Task EliminarAsync(int id);
    Task GuardarCambiosAsync();
    
    // Método para incluir relaciones si es necesario
    Task<IEnumerable<T>> ObtenerConIncluidosAsync(params Expression<Func<T, object>>[] includes);
    Task<T?> ObtenerPorIdConIncluidosAsync(int id, params Expression<Func<T, object>>[] includes);
}
