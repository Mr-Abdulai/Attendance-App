import api from './api';

export interface Session {
  id: string;
  lecturerId: string;
  name: string;
  qrCode: string;
  latitude: number;
  longitude: number;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: 'ACTIVE' | 'ENDED' | 'EXPIRED';
  createdAt: string;
  lecturer?: {
    id: string;
    name: string;
    email: string;
  };
  attendance?: Attendance[];
  _count?: {
    attendance: number;
  };
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  scannedAt: string;
  latitude: number;
  longitude: number;
  distance: number;
  status: 'VALID' | 'INVALID' | 'OUT_OF_RANGE' | 'EXPIRED' | 'DUPLICATE';
  student: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateSessionData {
  name: string;
  latitude: number;
  longitude: number;
}

export interface CreateSessionResponse {
  message: string;
  session: Session & { qrCodeImage: string };
}

export const sessionService = {
  async createSession(data: CreateSessionData): Promise<CreateSessionResponse> {
    const response = await api.post<CreateSessionResponse>('/sessions', data);
    return response.data;
  },

  async endSession(sessionId: string): Promise<{ message: string; session: Session }> {
    const response = await api.post(`/sessions/${sessionId}/end`);
    return response.data;
  },

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    const response = await api.delete(`/sessions/${sessionId}`);
    return response.data;
  },

  async getLecturerSessions(): Promise<{ sessions: Session[] }> {
    const response = await api.get<{ sessions: Session[] }>('/sessions/lecturer');
    return response.data;
  },

  async getSession(sessionId: string): Promise<{ session: Session }> {
    const response = await api.get<{ session: Session }>(`/sessions/${sessionId}`);
    return response.data;
  },
};

