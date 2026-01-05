using CursoOnline.Application.DTOs;
using CursoOnline.Application.Interfaces;
using CursoOnline.Domain.Entities;
using CursoOnline.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CursoOnline.Application.Services;

public class CourseService(ApplicationDbContext context) : ICourseService
{
    public async Task<IEnumerable<CourseDto>> GetAllActiveAsync()
    {
        var courses = await context.Courses.ToListAsync();
        
        return courses.Select(c => new CourseDto
        {
            Id = c.Id,
            Title = c.Title,
            Status = c.Status.ToString(),
            UpdatedAt = c.UpdatedAt
        });
    }

    public async Task<CourseDto?> GetSummaryAsync(Guid id)
    {
        var course = await context.Courses
            .Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return null;

        return new CourseDto
        {
            Id = course.Id,
            Title = course.Title,
            Status = course.Status.ToString(),
            TotalLessons = course.Lessons.Count, 
            UpdatedAt = course.UpdatedAt          
        };
    }

    public async Task<bool> PublishCourseAsync(Guid id)
    {
        var course = await context.Courses
            .Include(c => c.Lessons)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (course == null) return false;

        if (!course.Lessons.Any(l => !l.IsDeleted))
        {
            throw new InvalidOperationException("No se puede publicar un curso sin lecciones activas.");
        }

        course.Status = CourseStatus.Published;
        course.UpdatedAt = DateTime.UtcNow;

        return await context.SaveChangesAsync() > 0;
    }

    public async Task<CourseDto> CreateCourseAsync(string title)
    {
        var course = new Course { Title = title };
        
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        return new CourseDto
        {
            Id = course.Id,
            Title = course.Title,
            Status = course.Status.ToString(),
            UpdatedAt = course.UpdatedAt
        };
    }

    public async Task<bool> SoftDeleteCourseAsync(Guid id)
    {
        var course = await context.Courses.FindAsync(id);
        if (course == null) return false;

        course.IsDeleted = true;
        course.UpdatedAt = DateTime.UtcNow;

        return await context.SaveChangesAsync() > 0;
    }
    
    public async Task<bool> UnpublishCourseAsync(Guid id)
    {
        var course = await context.Courses.FindAsync(id);
        if (course == null) return false;

        course.Status = CourseStatus.Draft;
        course.UpdatedAt = DateTime.UtcNow;
    
        return await context.SaveChangesAsync() > 0;
    }

    public async Task<IEnumerable<CourseDto>> SearchAsync(string? q, CourseStatus? status, int page, int pageSize)
    {
        var query = context.Courses.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(q))
            query = query.Where(c => c.Title.Contains(q));

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var courses = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return courses.Select(c => new CourseDto
        {
            Id = c.Id,
            Title = c.Title,
            Status = c.Status.ToString()
        });
    }
}