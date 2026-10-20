using SIMAP.Endpoints;
using SIMAP.Models;
using SIMAP.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

// --- SEGURIDAD OWASP: API8 (Configuración de Seguridad) - CORS Estricto ---
// Solo se permiten orígenes explícitos del frontend. Nunca se usa "*".
// Se puede ampliar vía variable de entorno FRONTEND_URL para producción.
var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? "http://localhost:5173";
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",  // Vite dev server
                "http://localhost:3000",  // React Scripts alternativo
                frontendUrl               // URL de producción desde variable de entorno
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- SEGURIDAD OWASP: API4 (Consumo Ilimitado de Recursos) - Rate Limiting ---
// Evita ataques de denegación de servicio (DoS) o fuerza bruta limitando las peticiones
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonimo",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100, // Máximo 100 peticiones
                Window = TimeSpan.FromMinutes(1) // Por cada minuto, por IP
            }));
    
    // Mensaje de rechazo cuando se supera el límite
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("conexion")));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey ?? "ClaveSecretaMuyLargaParaDesarrollo12345!"))
    };
});

builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

// añadimos los servicios de autenticación 
builder.Services.AddScoped<AuthService>();

// registramos el repositorio genérico
builder.Services.AddScoped(typeof(SIMAP.Repositorios.IRepositorio<>), typeof(SIMAP.Repositorios.Repositorio<>));
// agregamos la cadena conexión

var app = builder.Build();

// --- SEGURIDAD: Cabeceras HTTP de seguridad (OWASP API8) ---
// Estas cabeceras protegen contra ataques comunes como clickjacking y sniffing de contenido.
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");       // Evita MIME sniffing
    context.Response.Headers.Append("X-Frame-Options", "DENY");                  // Evita clickjacking
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");        // Protección XSS en browsers viejos
    await next();
});

// Manejador global de excepciones para entornos no desarrollo (OWASP API8 - Errores genéricos sin trazas internas)
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(exceptionApp =>
    {
        exceptionApp.Run(async context =>
        {
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsJsonAsync(new { message = "Ocurrió un error interno en el servidor." });
        });
    });
}
else
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("SIMAP API")
        .WithTheme(ScalarTheme.BluePlanet)
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

// 1. Redirección HTTPS
app.UseHttpsRedirection();

// 2. CORS (DEBE ejecutarse antes de Authentication/Authorization para que peticiones preflight OPTIONS
//    y respuestas de error 401/403 incluyan las cabeceras Access-Control-Allow-Origin)
app.UseCors("PermitirFrontend");

// 3. Rate Limiting (OWASP API4)
app.UseRateLimiter();

// 4. Autenticación y Autorización
app.UseAuthentication(); // ¿Quién es?
app.UseAuthorization();  // ¿Qué permisos tiene?
app.MapAuthApi();
app.MapBitacoraAPI();
app.MapMantenimientoApi();
app.MapUsuarioApi();
app.MapVehiculoApi();
app.MapRolApi();
app.Run();
