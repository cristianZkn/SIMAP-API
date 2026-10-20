namespace SIMAP.Models;

/// <summary>
/// DTO público para Usuario.
/// OWASP API3: Object Property Level Authorization / Excessive Data Exposure.
/// Excluye deliberadamente el campo PasswordHash para evitar filtraciones de hashes.
/// </summary>
public record UsuarioDto(int Id, string Nombre, string Email, int RolId, string? Rol)
{
    public UsuarioDto(Usuario u) : this(u.Id, u.Nombre, u.Email, u.RolId, u.Rol?.Nombre) { }
}
