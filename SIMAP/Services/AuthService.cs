using SIMAP.Models;
using Microsoft.AspNetCore.Identity;

namespace SIMAP.Services;

public class AuthService
{
    private readonly PasswordHasher<Usuario> hasher = new();
    
    public string HashPassword(Usuario usuario, string password)
    {
        return hasher.HashPassword(usuario, password);
    }

    public PasswordVerificationResult VerifyPassword(Usuario usuario, string passwordIntento)
    {
        return hasher.VerifyHashedPassword(usuario, usuario.PasswordHash, passwordIntento);
    }
}