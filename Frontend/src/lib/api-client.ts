import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    CourseDto,
    LessonDto,
    CourseSearchParams,
    PaginatedResponse,
    CourseSummaryDto
} from '@/types/api';

const BASE_URL = 'http://localhost:5000/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add JWT token to requests
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Handle 401 errors
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/auth';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await this.client.post<AuthResponse>('/auth/login', data);
        return response.data;
    }

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await this.client.post<AuthResponse>('/auth/register', data);
        return response.data;
    }

    // Course endpoints
    async searchCourses(params: CourseSearchParams): Promise<PaginatedResponse<CourseDto>> {
        const response = await this.client.get<PaginatedResponse<CourseDto>>('/courses/search', {
            params,
        });
        return response.data;
    }

    async getCourse(id: string): Promise<CourseDto> {
        const response = await this.client.get<CourseDto>(`/courses/${id}`);
        return response.data;
    }

    async createCourse(title: string): Promise<CourseDto> {
        const response = await this.client.post<CourseDto>('/courses', { title });
        return response.data;
    }

    async publishCourse(id: string): Promise<void> {
        await this.client.patch(`/courses/${id}/publish`);
    }

    async unpublishCourse(id: string): Promise<void> {
        await this.client.patch(`/courses/${id}/unpublish`);
    }

    async getCourseSummary(id: string): Promise<CourseSummaryDto> {
        const response = await this.client.get<CourseSummaryDto>(`/courses/${id}/summary`);
        return response.data;
    }

    async getPublishedCourses(search?: string): Promise<CourseSummaryDto[]> {
        const response = await this.client.get<CourseSummaryDto[]>('/courses/published', {
            params: { search },
        });
        return response.data;
    }

    // Lesson endpoints
    async getLessons(courseId: string): Promise<LessonDto[]> {
        const response = await this.client.get<LessonDto[]>(`/lessons/course/${courseId}`);
        return response.data;
    }

    async createLesson(courseId: string, title: string): Promise<LessonDto> {
        const response = await this.client.post<LessonDto>('/lessons', { courseId, title });
        return response.data;
    }

    async deleteLesson(id: string): Promise<void> {
        await this.client.delete(`/lessons/${id}`);
    }

    async reorderLessons(courseId: string, lessonIds: string[]): Promise<void> {
        await this.client.patch(`/lessons/reorder/${courseId}`, lessonIds);
    }
}

export const apiClient = new ApiClient();