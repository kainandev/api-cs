namespace Api.Models {
    // Tipos de ingresso disponíveis para um lote
    public enum TicketType {
        Normal    = 0, // preço cheio
        HalfPrice = 1, // meia entrada (50% de desconto)
        VIP       = 2  // acesso VIP (50% mais caro)
    }
}