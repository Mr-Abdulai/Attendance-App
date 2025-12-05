export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
}

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
  session: Session;
  student: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'STUDENT' | 'LECTURER';
}

