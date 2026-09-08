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
// Definimos una política que solo permite peticiones desde orígenes específicos de nuestro Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://misitioseguro.com") // Reemplaza con la URL de tu frontend real
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

app.UseAuthentication(); //¿quién es?
app.UseAuthorization(); //¿qué puede hacer?

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("SIMAP API")
        .WithTheme(ScalarTheme.BluePlanet)
        .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

// Activar las mitigaciones de seguridad configuradas arriba
app.UseCors("PermitirFrontend");
app.UseRateLimiter();

app.UseHttpsRedirection();
app.MapAuthApi();
app.MapBitacoraAPI();
app.MapMantenimientoApi();
app.MapUsuarioApi();
app.MapVehiculoApi();
app.MapRolApi();
app.Run();
