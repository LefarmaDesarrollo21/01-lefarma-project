using Lefarma.API.Domain.Entities.Operaciones;

namespace Lefarma.API.Features.OrdenesCompra.Firmas.Handlers
{
// @lat: [[backend#Features]]
    public class Firma5Handler : IStepHandler
    {
        public string HandlerKey => "Firma5Handler";

        public Task<string?> ValidarAsync(OrdenCompra orden, Dictionary<string, object>? datos)
            => Task.FromResult<string?>(null);

        public Task AplicarAsync(OrdenCompra orden, Dictionary<string, object>? datos)
            => Task.CompletedTask;
    }
}
