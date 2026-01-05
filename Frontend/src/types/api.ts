// DTOs reflejados del backend
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
}

export interface AuthResponse {
    token: string;
    user: UserDto;
}

export interface UserDto {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'Student';
}

export interface CourseDto {
    id: string;
    title: string;
    status: 'Draft' | 'Published';
    totalLessons: number;
    updatedAt: string;
}

export interface LessonDto {
    id: string;
    courseId: string;
    title: string;
    order: number;
}

export interface CourseSearchParams {
    search?: string;
    status?: 'Draft' | 'Published' | '';
    page?: number;
    pageSize?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface CourseSummaryDto {
    id: string;
    title: string;
    totalLessons: number;
    description?: string;
}