using FluentValidation;
using Lefarma.API.Features.Catalogos.TipoGastos;
using Lefarma.API.Features.Catalogos.TipoGastos.DTOs;
using Lefarma.API.Shared.Extensions;
using Lefarma.API.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace Lefarma.API.Features.Catalogos;

[Route("api/catalogos/[controller]")]
[ApiController]
[EndpointGroupName("Catalogos")]
public class TipoGastoController : ControllerBase
{
    private readonly ITipoGastoService _tipoGastoService;

    public TipoGastoController(ITipoGastoService tipoGastoService)
    {
        _tipoGastoService = tipoGastoService;
    }

    [HttpGet]
    [SwaggerOperation(Summary = "Obtener todos los tipos de gasto", Description = "Retorna la lista completa de tipos de gasto")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _tipoGastoService.GetAllAsync();

        return result.ToActionResult(this, data => Ok(new ApiResponse<IEnumerable<TipoGastoResponse>>
        {
            Success = true,
            Message = "Tipos de gasto obtenidos exitosamente.",
            Data = data
        }));
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Obtener tipo de gasto por ID", Description = "Retorna un tipo de gasto específico por su identificador")]
    public async Task<IActionResult> GetById(
        [FromRoute][SwaggerParameter(Description = "Identificador único del tipo de gasto", Required = true)] int id)
    {
        var result = await _tipoGastoService.GetByIdAsync(id);

        return result.ToActionResult(this, data => Ok(new ApiResponse<TipoGastoResponse>
        {
            Success = true,
            Message = "Tipo de gasto obtenido exitosamente.",
            Data = data
        }));
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Crear nuevo tipo de gasto", Description = "Crea un tipo de gasto con los datos proporcionados")]
    public async Task<IActionResult> Create(
        [FromBody][SwaggerRequestBody(Description = "Datos del tipo de gasto a crear", Required = true)] CreateTipoGastoRequest request)
    {
        var result = await _tipoGastoService.CreateAsync(request);

        return result.ToActionResult(this, data => CreatedAtAction(
            nameof(GetById),
            new { id = data.IdTipoGasto },
            new ApiResponse<TipoGastoResponse>
            {
                Success = true,
                Message = "Tipo de gasto creado exitosamente.",
                Data = data
            }));
    }

    [HttpPut("{id}")]
    [SwaggerOperation(Summary = "Actualizar tipo de gasto", Description = "Actualiza los datos de un tipo de gasto existente")]
    public async Task<IActionResult> Update(
        [FromRoute][SwaggerParameter(Description = "Identificador del tipo de gasto a actualizar", Required = true)] int id,
        [FromBody][SwaggerRequestBody(Description = "Datos actualizados del tipo de gasto", Required = true)] UpdateTipoGastoRequest request)
    {
        var result = await _tipoGastoService.UpdateAsync(id, request);

        return result.ToActionResult(this, data => Ok(new ApiResponse<TipoGastoResponse>
        {
            Success = true,
            Message = "Tipo de gasto actualizado exitosamente.",
            Data = data
        }));
    }

    [HttpDelete("{id}")]
    [SwaggerOperation(Summary = "Eliminar tipo de gasto", Description = "Elimina un tipo de gasto por su identificador")]
    public async Task<IActionResult> Delete(
        [FromRoute][SwaggerParameter(Description = "Identificador del tipo de gasto a eliminar", Required = true)] int id)
    {
        var result = await _tipoGastoService.DeleteAsync(id);

        return result.ToActionResult(this, success => Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Tipo de gasto eliminado exitosamente.",
            Data = null
        }));
    }
}
