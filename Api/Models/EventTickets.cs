using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ApiCs.Models;

namespace Api.Models {
    public class EventTickets {
        public string Id {get; set; }
        public string Name { get; set; }
        public TypeTicket TypeTicket { get; set; }
        public decimal Price { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ValidUntil { get; set; }
        public string eventId { get; set; }
    }
}