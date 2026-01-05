using CursoOnline.Application.DTOs;
using CursoOnline.Application.Interfaces;
using CursoOnline.Domain.Entities;
using CursoOnline.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CursoOnline.Application.Services;

public class LessonService(ApplicationDbContext context) : ILessonService
{
    public async Task<IEnumerable<LessonDto>> GetByCourseIdAsync(Guid courseId)
    {
        var lessons = await context.Lessons
            .Where(l => l.CourseId == courseId)
            .OrderBy(l => l.Order)
            .ToListAsync();

        return lessons.Select(l => new LessonDto
        {
            Id = l.Id,
            CourseId = l.CourseId,
            Title = l.Title,
            Order = l.Order
        });
    }

    public async Task<LessonDto> CreateLessonAsync(LessonDto dto)
    {
        bool orderExists = await context.Lessons
            .AnyAsync(l => l.CourseId == dto.CourseId && l.Order == dto.Order);

        if (orderExists)
        {
            throw new InvalidOperationException($"Ya existe una lección con el orden {dto.Order} en este curso.");
        }

        var lesson = new Lesson
        {
            CourseId = dto.CourseId,
            Title = dto.Title,
            Order = dto.Order
        };

        context.Lessons.Add(lesson);
        await context.SaveChangesAsync();

        dto.Id = lesson.Id;
        return dto;
    }

    public async Task<bool> ReorderLessonsAsync(Guid courseId, List<Guid> orderedIds)
    {
        var lessons = await context.Lessons
            .Where(l => l.CourseId == courseId)
            .ToListAsync();

        if (lessons.Count != orderedIds.Count)
            throw new ArgumentException("La cantidad de IDs no coincide con las lecciones del curso.");

        for (int i = 0; i < orderedIds.Count; i++)
        {
            var lesson = lessons.FirstOrDefault(l => l.Id == orderedIds[i]);
            if (lesson != null)
            {
                lesson.Order = i + 1;
                lesson.UpdatedAt = DateTime.UtcNow;
            }
        }

        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> SoftDeleteLessonAsync(Guid id)
    {
        var lesson = await context.Lessons.FindAsync(id);
        if (lesson == null) return false;

        lesson.IsDeleted = true;
        lesson.UpdatedAt = DateTime.UtcNow;

        return await context.SaveChangesAsync() > 0;
    }

    public async Task<bool> UpdateLessonAsync(LessonDto dto)
    {
        var lesson = await context.Lessons.FindAsync(dto.Id);
        if (lesson == null) return false;

        lesson.Title = dto.Title;
        lesson.Order = dto.Order;
        lesson.UpdatedAt = DateTime.UtcNow;

        return await context.SaveChangesAsync() > 0;
    }
}