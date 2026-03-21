using FluentValidation;
using Lefarma.API.Features.Catalogos.UnidadesMedida.DTOs;

namespace Lefarma.API.Features.Catalogos.UnidadesMedida
{
    public class CreateUnidadMedidaValidator : AbstractValidator<CreateUnidadMedidaRequest>
    {
        public CreateUnidadMedidaValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(255).WithMessage("El nombre no puede exceder 255 caracteres");

            RuleFor(x => x.Abreviatura)
                .NotEmpty().WithMessage("La abreviatura es obligatoria")
                .MaximumLength(20).WithMessage("La abreviatura no puede exceder 20 caracteres");

            RuleFor(x => x.IdMedida)
                .GreaterThan(0).WithMessage("La medida es obligatoria");
        }
    }

    public class UpdateUnidadMedidaValidator : AbstractValidator<UpdateUnidadMedidaRequest>
    {
        public UpdateUnidadMedidaValidator()
        {
            RuleFor(x => x.IdUnidadMedida)
                .GreaterThan(0).WithMessage("El ID es obligatorio");

            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre es obligatorio")
                .MaximumLength(255).WithMessage("El nombre no puede exceder 255 caracteres");

            RuleFor(x => x.Abreviatura)
                .NotEmpty().WithMessage("La abreviatura es obligatoria")
                .MaximumLength(20).WithMessage("La abreviatura no puede exceder 20 caracteres");

            RuleFor(x => x.IdMedida)
                .GreaterThan(0).WithMessage("La medida es obligatoria");
        }
    }

    public class UnidadMedidaRequestValidator : AbstractValidator<UnidadMedidaRequest>
    {
        public UnidadMedidaRequestValidator()
        {
            RuleFor(x => x.OrderBy)
                .Must(value => string.IsNullOrWhiteSpace(value) || 
                    new[] { "nombre", "abreviatura", "fechacreacion" }.Contains(value.ToLower()))
                .WithMessage("OrderBy debe ser uno de: nombre, abreviatura, fechacreacion")
                .When(x => !string.IsNullOrWhiteSpace(x.OrderBy));

            RuleFor(x => x.OrderDirection)
                .Must(value => string.IsNullOrWhiteSpace(value) || 
                    new[] { "asc", "desc" }.Contains(value.ToLower()))
                .WithMessage("OrderDirection debe ser 'asc' o 'desc'")
                .When(x => !string.IsNullOrWhiteSpace(x.OrderDirection));
        }
    }
}
