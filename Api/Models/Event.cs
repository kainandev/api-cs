using Api.Models;

namespace Api.Models {
    // Representa um evento criado por um organizador na plataforma
    public class Event {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Address { get; set; } = "";
        public string Description { get; set; } = "";
        public DateTime Date { get; set; }
        public int MinAge { get; set; } = 0;
        public EventStatus Status { get; set; } = EventStatus.Active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Chave estrangeira: usuário que criou o evento
        public string OwnerId { get; set; } = "";

        // Lotes de ingressos criados para este evento (relação 1:N)
        public List<EventTicket> EventTickets { get; set; } = new();
    }
}