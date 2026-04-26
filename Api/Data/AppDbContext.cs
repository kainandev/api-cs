using Microsoft.EntityFrameworkCore;
using ApiCs.Models;

namespace ApiCs.Data {
    // DbContext = ponte entre o C# e o banco de dados
    public class AppDbContext : DbContext {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Cada DbSet vira uma tabela no banco
        public DbSet<Event> Events { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            // Precision do decimal (10 dígitos, 2 casas decimais)
            modelBuilder.Entity<Event>()
                .Property(e => e.PriceBase)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Ticket>()
                .Property(i => i.PriceFinal)
                .HasColumnType("decimal(10,2)");

            // VagasRestantes é calculada em código, não existe no banco
            modelBuilder.Entity<Event>()
                .Ignore(e => e.RestAmount);

            modelBuilder.Entity<User>()
                .Property(u => u.Status)
                .HasConversion<string>()
                .HasDefaultValue(Status.Active);
        }
    }
}
