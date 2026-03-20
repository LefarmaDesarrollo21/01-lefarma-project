using FluentValidation;
using Lefarma.API.Domain.Entities.Catalogos;
using Lefarma.API.Features.Catalogos.Sucursales.DTOs;

namespace Lefarma.API.Features.Catalogos.Sucursales
{
    public class CreateSucursalRequestValidator : AbstractValidator<CreateSucursalRequest>
    {
        public CreateSucursalRequestValidator()
        {
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre de la empresa es obligatorio")
                .MaximumLength(255).WithMessage("El nombre no puede exceder 255 caracteres")
                .MinimumLength(3).WithMessage("El nombre debe tener al menos 3 caracteres");

            RuleFor(x => x.Descripcion)
                .NotEmpty().WithMessage("La descripción de la empresa es obligatoria")
                .MaximumLength(500).WithMessage("La descripción no puede tener más de 500 caracteres")
                .MinimumLength(3).WithMessage("La descripción debe tener al menos 3 caracteres");

            RuleFor(x => x.Direccion)
                .MaximumLength(500).WithMessage("La dirección no puede exceder 500 caracteres")
                .When(x => !string.IsNullOrEmpty(x.Direccion));

            RuleFor(x => x.CodigoPostal)
                .Matches(@"^\d{5}$").WithMessage("El código postal debe tener 5 dígitos")
                .When(x => !string.IsNullOrEmpty(x.CodigoPostal));

            RuleFor(x => x.Telefono)
                .Matches(@"^\d{7,20}$").WithMessage("El teléfono debe contener entre 7 y 20 dígitos numéricos");

            RuleFor(x => x.Latitud)
                .InclusiveBetween(-90, 90).WithMessage("La latitud debe estar entre -90 y 90 grados");

            RuleFor(x => x.Longitud)
                .InclusiveBetween(-180, 180).WithMessage("La longitud debe estar entre -180 y 180 grados");

            RuleFor(x => x.NumeroEmpleados)
                .GreaterThanOrEqualTo(0).WithMessage("El número de empleados debe ser mayor o igual a 0");

        }
    }

    public class UpdateSucursalRequestValidator : AbstractValidator<UpdateSucursalRequest>
    {
        public UpdateSucursalRequestValidator()
        {
            RuleFor(x => x.IdSucursal)
            .NotEmpty().WithMessage("El IdSucursal es obligatorio")
            .GreaterThan(0).WithMessage("El IdSucursal debe ser un número mayor a 0");

            RuleFor(x => x.IdEmpresa)
                .NotEmpty().WithMessage("Es necesario asignarle una empresa")
                .GreaterThan(0).WithMessage("El IdEmpresa debe un número mayor a 0");
          
            RuleFor(x => x.Nombre)
                .NotEmpty().WithMessage("El nombre de la empresa es obligatorio")
                .MaximumLength(255).WithMessage("El nombre no puede exceder 255 caracteres")
                .MinimumLength(3).WithMessage("El nombre debe tener al menos 3 caracteres");

            RuleFor(x => x.Descripcion)
                .NotEmpty().WithMessage("La descripción de la empresa es obligatoria")
                .MaximumLength(500).WithMessage("La descripción no puede tener más de 500 caracteres")
                .MinimumLength(3).WithMessage("La descripción debe tener al menos 3 caracteres");

            RuleFor(x => x.Direccion)
                .MaximumLength(500).WithMessage("La dirección no puede exceder 500 caracteres")
                .When(x => !string.IsNullOrEmpty(x.Direccion));

            RuleFor(x => x.CodigoPostal)
                .Matches(@"^\d{5}$").WithMessage("El código postal debe tener 5 dígitos")
                .When(x => !string.IsNullOrEmpty(x.CodigoPostal));

            RuleFor(x => x.Telefono)
                .Matches(@"^\d{7,20}$").WithMessage("El teléfono debe contener entre 7 y 20 dígitos numéricos");

            RuleFor(x => x.NumeroEmpleados)
                .GreaterThanOrEqualTo(0).WithMessage("El número de empleados debe ser mayor o igual a 0");
        }
    }

    public class SucursalRequestValidator : AbstractValidator<SucursalRequest>
    {
        public SucursalRequestValidator()
        {
            RuleFor(x => x.OrderBy)
                .Must(value => string.IsNullOrWhiteSpace(value) || 
                    new[] { "nombre", "ciudad", "estado", "fechacreacion" }.Contains(value.ToLower()))
                .WithMessage("OrderBy debe ser uno de: nombre, ciudad, estado, fechacreacion")
                .When(x => !string.IsNullOrWhiteSpace(x.OrderBy));

            RuleFor(x => x.OrderDirection)
                .Must(value => string.IsNullOrWhiteSpace(value) || 
                    new[] { "asc", "desc" }.Contains(value.ToLower()))
                .WithMessage("OrderDirection debe ser 'asc' o 'desc'")
                .When(x => !string.IsNullOrWhiteSpace(x.OrderDirection));
        }
    }   
}
