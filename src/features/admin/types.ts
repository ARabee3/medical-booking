// Admin feature types

export type { User, Appointment } from '@/types/global';

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingApprovals: number;
}
