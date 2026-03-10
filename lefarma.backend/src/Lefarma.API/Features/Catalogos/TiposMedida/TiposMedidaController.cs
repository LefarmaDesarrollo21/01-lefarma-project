using FluentValidation;
using Lefarma.API.Features.Catalogos.TiposMedida;
using Lefarma.API.Features.Catalogos.TiposMedida.DTOs;
using Lefarma.API.Shared.Extensions;
using Lefarma.API.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Catalogos;

[Route("api/catalogos/[controller]")]
[ApiController]
[EndpointGroupName("Catalogos")]
public class TiposMedidaController : ControllerBase
{
    private readonly ITipoMedidaService _service;

    public TiposMedidaController(ITipoMedidaService service)
    {
        _service = service;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los tipos de medida", Description = "Retorna la lista completa de tipos de medida")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();

        return result.ToActionResult(this, data => Ok(new ApiResponse<IEnumerable<TipoMedidaResponse>>
        {
            Success = true,
            Message = "Tipos de medida obtenidos exitosamente.",
            Data = data
        }));
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Obtener tipo de medida por ID", Description = "Retorna un tipo de medida específico por su identificador")]
    public async Task<IActionResult> GetById(
        [FromRoute][SwaggerParameter(Description = "Identificador único del tipo de medida", Required = true)] int id)
    {
        var result = await _service.GetByIdAsync(id);

        return result.ToActionResult(this, data => Ok(new ApiResponse<TipoMedidaResponse>
        {
            Success = true,
            Message = "Tipo de medida obtenido exitosamente.",
            Data = data
        }));
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Crear nuevo tipo de medida", Description = "Crea un tipo de medida con los datos proporcionados")]
    public async Task<IActionResult> Create(
        [FromBody][SwaggerRequestBody(Description = "Datos del tipo de medida a crear", Required = true)] CreateTipoMedidaRequest request)
    {
        var result = await _service.CreateAsync(request);

        return result.ToActionResult(this, data => CreatedAtAction(
            nameof(GetById),
            new { id = data.IdTipoMedida },
            new ApiResponse<TipoMedidaResponse>
            {
                Success = true,
                Message = "Tipo de medida creado exitosamente.",
                Data = data
            }));
    }

    [HttpPut("{id}")]
    [SwaggerOperation(Summary = "Actualizar tipo de medida", Description = "Actualiza los datos de un tipo de medida existente")]
    public async Task<IActionResult> Update(
        [FromRoute][SwaggerParameter(Description = "Identificador del tipo de medida a actualizar", Required = true)] int id,
        [FromBody][SwaggerRequestBody(Description = "Datos actualizados del tipo de medida", Required = true)] UpdateTipoMedidaRequest request)
    {
        var result = await _service.UpdateAsync(id, request);

        return result.ToActionResult(this, data => Ok(new ApiResponse<TipoMedidaResponse>
        {
            Success = true,
            Message = "Tipo de medida actualizado exitosamente.",
            Data = data
        }));
    }

    [HttpDelete("{id}")]
    [SwaggerOperation(Summary = "Eliminar tipo de medida", Description = "Elimina un tipo de medida por su identificador")]
    public async Task<IActionResult> Delete(
        [FromRoute][SwaggerParameter(Description = "Identificador del tipo de medida a eliminar", Required = true)] int id)
    {
        var result = await _service.DeleteAsync(id);

        return result.ToActionResult(this, success => Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Tipo de medida eliminado exitosamente.",
            Data = null
        }));
    }
}
