namespace Api.Models {
    // Representa um lote de ingressos criado pelo organizador do evento.
    // Exemplos: Pré-venda, 1° Lote, Pista VIP.
    // Cada lote tem seu preço, quantidade e período de vendas independentes.
    public class EventTicket {
        public int Id { get; set; }
        public string Name { get; set; } = ""; 
        public string Description { get; set; } = "";
        public TicketType Type { get; set; } = TicketType.Normal; //puxa do TypeTicket.cs, inteira, media...
        public decimal Price { get; set; } //preço 0,00
        public int TotalAmount { get; set; }
        public int SoldAmount { get; set; } = 0;
        public DateTime SalesStart { get; set; }
        public DateTime SalesEnd { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Calculado em tempo real, não é salvo no banco
        public int AvailableAmount => TotalAmount - SoldAmount; 

        // Chave estrangeira: a qual evento este lote pertence
        public int EventId { get; set; } //puxa do Event.cs
        
    }
}
