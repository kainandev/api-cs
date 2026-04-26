using Microsoft.EntityFrameworkCore;
using Api.Models;

namespace Api.Data {
    // Ponte entre os modelos C# e o banco de dados.
    // Cada DbSet vira uma tabela no banco.
    public class AppDbContext : DbContext {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Event> Events { get; set; }
        public DbSet<EventTicket> EventTickets { get; set; }
        public DbSet<Ticket> Tickets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) {
            // Precisão dos campos de preço no banco (ex: 1999.99)
            modelBuilder.Entity<EventTicket>()
                .Property(et => et.Price)
                .HasColumnType("decimal(10,2)");

            modelBuilder.Entity<Ticket>()
                .Property(t => t.PriceFinal)
                .HasColumnType("decimal(10,2)");

            // AvailableAmount é calculado em código, não existe como coluna no banco
            modelBuilder.Entity<EventTicket>()
                .Ignore(et => et.AvailableAmount);

            // Status salvos como texto no banco para facilitar leitura direta no banco
            modelBuilder.Entity<User>()
                .Property(u => u.Status)
                .HasConversion<string>()
                .HasDefaultValue(UserStatus.Active);

            modelBuilder.Entity<Event>()
                .Property(e => e.Status)
                .HasConversion<string>()
                .HasDefaultValue(EventStatus.Active);

            // Relacionamento: Ticket pertence a um EventTicket, mas EventTicket não lista Tickets
            // Isso evita loop de dependência na serialização JSON
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.EventTicket)
                .WithMany()
                .HasForeignKey(t => t.EventTicketId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacionamento: User tem muitos Tickets, mas Ticket não navega de volta para User
            modelBuilder.Entity<User>()
                .HasMany(u => u.Tickets)
                .WithOne()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}