using System;

namespace CursoOnline.Application.DTOs;

public class CourseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    
    public int TotalLessons { get; set; }
    
    public DateTime UpdatedAt { get; set; }
}