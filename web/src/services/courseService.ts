import api from './api';

export interface Course {
    id: string;
    name: string;
    code: string;
    description?: string;
    _count?: {
        sessions: number;
    };
}

export interface CreateCourseData {
    name: string;
    code: string;
    description?: string;
}

export const courseService = {
    async getCourses(): Promise<{ courses: Course[] }> {
        const response = await api.get('/courses');
        return response.data;
    },

    async createCourse(data: CreateCourseData): Promise<{ message: string; course: Course }> {
        const response = await api.post('/courses', data);
        return response.data;
    },

    async deleteCourse(id: string): Promise<{ message: string }> {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    },
};
