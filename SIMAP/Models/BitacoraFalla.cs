namespace SIMAP.Models;

public class BitacoraFalla
{
    public int Id { get; set; }
    public int VehiculoId { get; set; }
    public Vehiculo? Vehiculo { get; set; }
    public int UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }
    public DateTime FechaReporte { get; set; } = DateTime.UtcNow;
    public string Descripcion { get; set; } = string.Empty;
    public string Prioridad { get; set; } = "Media";
    public string EstadoFalla { get; set; } = "Reportada";
}