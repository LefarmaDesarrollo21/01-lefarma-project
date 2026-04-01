namespace Lefarma.API.Shared.Models
{

// @lat: [[backend#Shared]]
    public class ErrorDetail
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Field { get; set; }
    }
}
