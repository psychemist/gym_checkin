export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipType?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  sessionType: SessionType;
  createdAt: string;
}

export interface WorkoutSession {
  id: string;
  attendanceId: string;
  userId: string;
  muscleGroups: MuscleGroup[];
  notes?: string;
  duration?: number; // in minutes
  createdAt: string;
}

export const SessionType = {
  MORNING: 'MORNING',
  EVENING: 'EVENING'
} as const;

export type SessionType = typeof SessionType[keyof typeof SessionType];

export const MuscleGroup = {
  CHEST: 'chest',
  BACK: 'back',
  SHOULDERS: 'shoulders',
  ARMS: 'arms',
  LEGS: 'legs',
  CORE: 'core',
  CARDIO: 'cardio'
} as const;

export type MuscleGroup = typeof MuscleGroup[keyof typeof MuscleGroup];

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  membershipType?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CheckInRequest {
  sessionType?: SessionType;
}

export interface CheckInResponse {
  attendance: Attendance;
  message: string;
}

export interface CalendarDay {
  date: string;
  hasMorningSession: boolean;
  hasEveningSession: boolean;
  workoutData?: WorkoutSession;
  checkInTime?: string;
  duration?: number;
}