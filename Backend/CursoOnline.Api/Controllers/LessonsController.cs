using CursoOnline.Application.Interfaces;
using CursoOnline.Application.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace CursoOnline.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LessonsController(ILessonService lessonService) : ControllerBase
{
    [HttpGet("course/{courseId}")]
    public async Task<ActionResult<IEnumerable<LessonDto>>> GetByCourse(Guid courseId)
    {
        var lessons = await lessonService.GetByCourseIdAsync(courseId);
        return Ok(lessons);
    }

    [HttpPost]
    public async Task<ActionResult<LessonDto>> Create([FromBody] LessonDto lessonDto)
    {
        try
        {
            var created = await lessonService.CreateLessonAsync(lessonDto);
            return CreatedAtAction(nameof(GetByCourse), new { courseId = created.CourseId }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("reorder/{courseId}")]
    public async Task<IActionResult> Reorder(Guid courseId, [FromBody] List<Guid> orderedIds)
    {
        try
        {
            var result = await lessonService.ReorderLessonsAsync(courseId, orderedIds);
            if (!result) return NotFound();
            
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await lessonService.SoftDeleteLessonAsync(id);
        if (!result) return NotFound();
        
        return NoContent();
    }
}