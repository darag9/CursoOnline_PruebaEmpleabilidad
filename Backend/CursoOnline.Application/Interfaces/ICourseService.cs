using CursoOnline.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CursoOnline.Domain.Entities;

namespace CursoOnline.Application.Interfaces;

public interface ICourseService
{
    Task<CourseDto?> GetSummaryAsync(Guid id);

    Task<bool> PublishCourseAsync(Guid id);

    Task<IEnumerable<CourseDto>> GetAllActiveAsync();
    Task<CourseDto> CreateCourseAsync(string title);
    
    Task<bool> SoftDeleteCourseAsync(Guid id);
    Task<bool> UnpublishCourseAsync(Guid id);
    Task<IEnumerable<CourseDto>> SearchAsync(string? q, CourseStatus? status, int page, int pageSize);
}