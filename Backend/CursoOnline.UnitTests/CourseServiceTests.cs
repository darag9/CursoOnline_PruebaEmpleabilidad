using CursoOnline.Application.DTOs;
using CursoOnline.Application.Services;
using CursoOnline.Domain.Entities;
using CursoOnline.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace CursoOnline.UnitTests;

public class CourseServiceTests
{
    // Helper para crear un DbContext en memoria limpio para cada test
    private ApplicationDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Nombre único para evitar colisiones
            .Options;
        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task PublishCourse_WithLessons_ShouldSucceed()
    {
        // Arrange
        var context = GetDbContext();
        var service = new CourseService(context);
        var course = new Course { Title = "Curso con Lecciones" };
        course.Lessons.Add(new Lesson { Title = "Lección 1", Order = 1 });
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        // Act
        var result = await service.PublishCourseAsync(course.Id);

        // Assert
        Assert.True(result);
        var updatedCourse = await context.Courses.FindAsync(course.Id);
        Assert.Equal(CourseStatus.Published, updatedCourse!.Status);
    }

    [Fact]
    public async Task PublishCourse_WithoutLessons_ShouldFail()
    {
        // Arrange
        var context = GetDbContext();
        var service = new CourseService(context);
        var course = new Course { Title = "Curso Vacío" };
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            service.PublishCourseAsync(course.Id));
    }

    [Fact]
    public async Task CreateLesson_WithUniqueOrder_ShouldSucceed()
    {
        // Arrange
        var context = GetDbContext();
        var lessonService = new LessonService(context);
        var courseId = Guid.NewGuid();
        var dto = new LessonDto { CourseId = courseId, Title = "Lección 1", Order = 1 };

        // Act
        var result = await lessonService.CreateLessonAsync(dto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.Order);
    }

    [Fact]
    public async Task CreateLesson_WithDuplicateOrder_ShouldFail()
    {
        // Arrange
        var context = GetDbContext();
        var lessonService = new LessonService(context);
        var courseId = Guid.NewGuid();
        
        context.Lessons.Add(new Lesson { CourseId = courseId, Title = "Existente", Order = 1 });
        await context.SaveChangesAsync();

        var duplicateDto = new LessonDto { CourseId = courseId, Title = "Duplicada", Order = 1 };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            lessonService.CreateLessonAsync(duplicateDto));
    }

    [Fact]
    public async Task DeleteCourse_ShouldBeSoftDelete()
    {
        // Arrange
        var context = GetDbContext();
        var service = new CourseService(context);
        var course = new Course { Title = "Curso a Borrar" };
        context.Courses.Add(course);
        await context.SaveChangesAsync();

        // Act
        await service.SoftDeleteCourseAsync(course.Id);

        // Assert
        var deletedCourse = await context.Courses
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == course.Id);

        Assert.NotNull(deletedCourse);
        Assert.True(deletedCourse.IsDeleted);
    }
}