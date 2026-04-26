using Microsoft.EntityFrameworkCore;
using ApiCs.Models;

namespace ApiCs.Data
{
    // DbContext = ponte entre o C# e o banco de dados
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Cada DbSet vira uma tabela no banco
        public DbSet<Evento> Eventos { get; set; }
        public DbSet<Ingresso> Ingressos { get; set; }
        public DbSet<Users> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Precision do decimal (10 dígitos, 2 casas decimais)
            modelBuilder.Entity<Evento>()
                .Property(e => e.PrecoBase)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Ingresso>()
                .Property(i => i.PrecoFinal)
                .HasColumnType("decimal(10,2)");

            // VagasRestantes é calculada em código, não existe no banco
            modelBuilder.Entity<Evento>()
                .Ignore(e => e.VagasRestantes);

            modelBuilder.Entity<Users>()
                .Property(u => u.Status)
                .HasConversion<string>()
                .HasDefaultValue(Status.Active);
        }
    }
}
