namespace Api.Models
{
    public class Users
    {
        public string Id { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Cpf { get; set; }
        public DateTime CreatedAt { get; set; }
        public Status Status { get; set; }
    }

    public enum Status {
        Active,
        Disabled,
        Deleted
    }
}