namespace Lefarma.API.Shared.Models
{
    // @lat: [[backend-architecture#Key Abstractions]]
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<ErrorDetail>? Errors { get; set; }
    }
}
