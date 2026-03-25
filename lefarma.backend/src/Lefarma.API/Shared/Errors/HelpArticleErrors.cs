using ErrorOr;

namespace Lefarma.API.Shared.Errors;

public static partial class Errors
{
    public static class HelpArticle
    {
        public static readonly Error NotFound = Error.NotFound(
            code: "HelpArticle.NotFound",
            description: "El artículo de ayuda no existe"
        );
    }
}
