using SIMAP.Endpoints;
using SIMAP.Models;
using SIMAP.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

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

app.UseHttpsRedirection();
app.MapAuthApi();
app.MapBitacoraAPI();
app.MapMantenimientoApi();
app.MapUsuarioApi();
app.MapVehiculoApi();
app.MapRolApi();
app.Run();
