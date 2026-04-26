namespace ApiCs.Models {
    // Tabela "Tickets" no banco de dados

    public class Ticket {
        public int Id { get; set; }

        // Chave estrangeira: a qual User esse Ticket pertence       
        public string UserId { get; set; }
        public User? User { get; set; }

        // Tipo de ingresso: Normal, meia e VIP.
        public TypeTicket typeTicket { get; set; } = TypeTicket.Normal;
        public decimal PriceFinal { get; set; }

        // Data da ciompra do ingresso.
        public DateTime DateBuy { get; set; } = DateTime.Now;

        // Chave estrangeira: a qual Event esse Ticket pertence
        public int EventId { get; set; }
        public Event? Event { get; set; }
    }
}
