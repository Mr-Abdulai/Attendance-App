import api from './api';
import { Attendance } from '../types';

export interface MarkAttendanceData {
  qrCode: string;
  latitude: number;
  longitude: number;
}

export interface MarkAttendanceResponse {
  message: string;
  attendance: Attendance;
}

export interface AttendanceHistoryResponse {
  attendance: Attendance[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const attendanceService = {
  async markAttendance(data: MarkAttendanceData): Promise<MarkAttendanceResponse> {
    const response = await api.post<MarkAttendanceResponse>('/attendance/mark', data);
    return response.data;
  },

  async getAttendanceHistory(limit: number = 50, offset: number = 0): Promise<AttendanceHistoryResponse> {
    const response = await api.get<AttendanceHistoryResponse>('/attendance/history', {
      params: { limit, offset },
    });
    return response.data;
  },
};

