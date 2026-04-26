using Microsoft.EntityFrameworkCore;
using ApiCs.Data;
using ApiCs.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Banco de dados SQLite (cria o arquivo "data.db" automaticamente)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=data.db")
);

// Registra os repositórios para injeção de dependência
builder.Services.AddScoped<EventRepository>();
builder.Services.AddScoped<TicketRepository>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cria as tabelas no banco automaticamente na primeira execução
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Instancia Swegger para documentação da API
app.UseSwagger();
app.UseSwaggerUI();

// Mapeia os controladores para as rotas da API
app.MapControllers();

// Inicia a aplicação
app.Run();
