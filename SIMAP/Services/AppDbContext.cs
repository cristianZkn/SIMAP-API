using Microsoft.EntityFrameworkCore;
using SIMAP.Models;

namespace SIMAP.Services;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Rol> Roles => Set<Rol>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Vehiculo> Vehiculos => Set<Vehiculo>();
    public DbSet<BitacoraFalla> BitacoraFallas => Set<BitacoraFalla>();
    public DbSet<Mantenimiento> Mantenimientos => Set<Mantenimiento>();
}