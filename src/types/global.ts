export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface User {
  id: number;
  email: string;
  password?: string; // Only present in mock data, never exposed in API
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_approved: boolean;
}

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialty: string;
  bio: string;
  image_url: string | null;
  is_active: boolean;
}

export interface Patient {
  id: number;
  user_id: number;
  name: string;
  email: string;
}

export interface Appointment {
  id: number;
  doctor: Doctor;
  patient?: Patient;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  notes: string | null;
  created_at: string; // ISO 8601
}

export interface AvailabilitySlot {
  id: number;
  doctor_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface ApiError {
  detail?: string;
  [key: string]: string[] | string | undefined;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password_confirm: string;
  role: Exclude<UserRole, 'ADMIN'>;
  first_name: string;
  last_name: string;
}

export interface JWTPair {
  access: string;
  refresh: string;
}

export interface BookingRequest {
  doctor_id: number;
  date: string;
  time: string;
}
