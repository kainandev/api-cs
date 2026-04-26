using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using Api.Data;
using Api.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Banco de dados SQLite (o arquivo data.db é criado automaticamente)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=data.db")
);

// Registro dos repositórios para injeção de dependência
// Toda vez que um controller pedir um IUserRepository, o .NET entrega um UserRepository
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IEventTicketRepository, EventTicketRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();

// Configura o JSON para ignorar referências circulares na serialização
builder.Services.AddControllers().AddJsonOptions(options => {
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Cria as tabelas no banco automaticamente na primeira execução
using (var scope = app.Services.CreateScope()) {
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

app.Run();