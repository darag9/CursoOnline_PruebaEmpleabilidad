using CursoOnline.Application.Interfaces;
using CursoOnline.Application.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using CursoOnline.Domain.Entities;

namespace CursoOnline.Api.Controllers;

[ApiController]
[Route("api/courses")]
[Authorize]
public class CoursesController(ICourseService courseService) : ControllerBase
{
    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q, [FromQuery] CourseStatus? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await courseService.SearchAsync(q, status, page, pageSize));
    }

    [HttpGet("{id}/summary")]
    public async Task<IActionResult> GetSummary(Guid id) => Ok(await courseService.GetSummaryAsync(id));

    [HttpPatch("{id}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Publish(Guid id) => Ok(await courseService.PublishCourseAsync(id));

    [HttpPatch("{id}/unpublish")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Unpublish(Guid id) => Ok(await courseService.UnpublishCourseAsync(id));
}