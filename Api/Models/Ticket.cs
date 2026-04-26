namespace ApiCs.Models {
    // Tabela "Tickets" no banco de dados

    public class Ticket {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public User? User { get; set; }
        public int Age { get; set; }
        public TypeTicket typeTicket { get; set; } = TypeTicket.Normal;
        public decimal PriceFinal { get; set; }
        public DateTime DateBuy { get; set; } = DateTime.Now;

        // Chave estrangeira: a qual Event esse Ticket pertence
        public int EventId { get; set; }
        public Event? Event { get; set; }
    }
}
