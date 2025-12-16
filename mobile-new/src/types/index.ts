export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
  studentId?: string;
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
  course?: {
    name: string;
    code: string;
  };
}

export interface Attendance {
  id: string;
  sessionId: string;
  studentId: string;
  scannedAt: string;
  latitude: number;
  longitude: number;
  distance?: number;
  status: 'VALID' | 'INVALID' | 'OUT_OF_RANGE' | 'EXPIRED' | 'DUPLICATE';
  type?: 'QR' | 'MANUAL' | 'EXCUSED';
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
