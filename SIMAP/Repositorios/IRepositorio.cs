using System.Linq.Expressions;

namespace SIMAP.Repositorios;

public interface IRepositorio<T> where T : class
{
    // Obtiene toda la colección de la base de datos
    Task<IEnumerable<T>> ObtenerTodosAsync();
    
    // Busca un registro específico
    Task<T?> ObtenerPorIdAsync(int id);
    
    // Inserta un nuevo registro
    Task AgregarAsync(T entidad);
    
    // Marca un registro como modificado
    Task ActualizarAsync(T entidad);
    
    // Elimina un registro por ID
    Task EliminarAsync(int id);
    
    // Ejecuta las operaciones pendientes (transacción)
    Task GuardarCambiosAsync();
    
    // Obtiene todos los registros incluyendo entidades hijas o padres (JOINs)
    Task<IEnumerable<T>> ObtenerConIncluidosAsync(params Expression<Func<T, object>>[] includes);
    
    // Obtiene un registro por ID incluyendo entidades hijas o padres (JOINs)
    Task<T?> ObtenerPorIdConIncluidosAsync(int id, params Expression<Func<T, object>>[] includes);
}
