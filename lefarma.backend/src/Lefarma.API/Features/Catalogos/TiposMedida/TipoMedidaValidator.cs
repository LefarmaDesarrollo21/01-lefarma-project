using FluentValidation;
using Lefarma.API.Features.Catalogos.TiposMedida.DTOs;

namespace Lefarma.API.Features.Catalogos.TiposMedida
{
    public class CreateTipoMedidaValidator : AbstractValidator<CreateTipoMedidaRequest>
    {
        public CreateTipoMedidaValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(80).WithMessage("El nombre no puede exceder 80 caracteres");
        }
    }

    public class UpdateTipoMedidaValidator : AbstractValidator<UpdateTipoMedidaRequest>
    {
        public UpdateTipoMedidaValidator()
        {
            RuleFor(x => x.IdTipoMedida)
                .GreaterThan(0).WithMessage("El ID es obligatorio");

            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(80).WithMessage("El nombre no puede exceder 80 caracteres");
        }
    }
}
