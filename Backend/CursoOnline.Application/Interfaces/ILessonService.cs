using CursoOnline.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CursoOnline.Application.Interfaces;

public interface ILessonService
{
    Task<IEnumerable<LessonDto>> GetByCourseIdAsync(Guid courseId);

    Task<LessonDto> CreateLessonAsync(LessonDto lessonDto);

    Task<bool> UpdateLessonAsync(LessonDto lessonDto);

    Task<bool> SoftDeleteLessonAsync(Guid id);

    Task<bool> ReorderLessonsAsync(Guid courseId, List<Guid> orderedIds);
}