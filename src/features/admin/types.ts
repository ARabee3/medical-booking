// Admin feature types
import type { User, AppointmentStatus } from '@/types/global';

export type { User, Appointment } from '@/types/global';

// Matches Django response exactly (snake_case)
export interface AdminStats {
  total_users: number;
  total_doctors: number;
  total_appointments: number;
  pending_approvals: number;
}

export interface AdminAppointment {
  id: number;
  doctor: {
    id: number;
    name: string;
    email: string;
    specialty: string | null;
    image_url: string | null;
  };
  patient: {
    id: number;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Admin-facing user — includes date_joined
export interface AdminUser extends User {
  date_joined: string;
}

// Specialty CRUD
export interface Specialty {
  id: number;
  name: string;
  description: string;
  icon: string;
  doctors_count: number;
}

export interface SpecialtyPayload {
  name: string;
  description?: string;
  icon?: string;
}
