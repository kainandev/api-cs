using Api.Models;

namespace Api.Models {
    // Representa um evento criado por um organizador na plataforma
    public class Event {
        public int Id { get; set; }   //ID único
        public string Name { get; set; } = "";  //Nome do evento, por exemplo, "Show do Coldplay"
        public string Address { get; set; } = "";  //endereço/local
        public string Description { get; set; } = "";  //sobre o evento
        public DateTime Date { get; set; }  //data e horário
        public int MinAge { get; set; } = 0;  //restirngir para menores de x anos.
        public EventStatus Status { get; set; } = EventStatus.Active;  // puxa do EventStatus.cs Se o evento está ativo, para que um evento com data no passado não ocorra no futuro
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  //Data de criação/registro

        // Chave estrangeira: usuário que criou o evento
        public string OwnerId { get; set; } = ""; 

        // Lotes de ingressos criados para este evento (relação 1:N)
        public List<EventTicket> EventTickets { get; set; } = new();
    }
}
