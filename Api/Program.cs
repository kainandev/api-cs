using Microsoft.EntityFrameworkCore;
using IngressosAPI.Data;
using IngressosAPI.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Banco de dados SQLite (cria o arquivo "ingressos.db" automaticamente)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=ingressos.db"));

// Registra os repositórios para injeção de dependência
builder.Services.AddScoped<EventoRepository>();
builder.Services.AddScoped<IngressoRepository>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cria as tabelas no banco automaticamente na primeira execução
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();
app.Run();
