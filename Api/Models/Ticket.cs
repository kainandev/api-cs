namespace Api.Models {
    // Representa o comprovante de compra de um ingresso por um usuário.
    // Um Ticket é gerado quando um usuário compra a partir de um EventTicket (lote).
    public class Ticket {
        public string Id { get; set; } = "";
        public decimal PriceFinal { get; set; }
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        // Chave estrangeira: usuário que realizou a compra
        public string UserId { get; set; } = "";

        // Chave estrangeira: lote do qual este ingresso foi comprado
        public int EventTicketId { get; set; }

        // Dados do lote carregados para exibição (via Include no repositório)
        public EventTicket? EventTicket { get; set; }
    }
}