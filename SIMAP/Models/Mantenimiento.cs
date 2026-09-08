namespace SIMAP.Models;

public class Mantenimiento
{
    public int Id { get; set; }
    public int VehiculoId { get; set; }
    public Vehiculo? Vehiculo { get; set; }
    public int? FallaId { get; set; }
    public BitacoraFalla? Falla { get; set; }
    public string Tipo { get; set; } = "Preventivo";
    public DateTime FechaProgramada { get; set; }
    public decimal Costo { get; set; }
    public string TallerResponsable { get; set; } = string.Empty;
    public string Estado { get; set; } = "Programado";
}