import { User, Doctor, Appointment, AvailabilitySlot } from '@/types/global';

// ==========================
// Demo Accounts
// ==========================

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@demo.com',
    password: 'demopass123',
    first_name: 'System',
    last_name: 'Admin',
    role: 'ADMIN',
    is_active: true,
    is_approved: true,
  },
  {
    id: 2,
    email: 'doctor@demo.com',
    password: 'demopass123',
    first_name: 'Sarah',
    last_name: 'Chen',
    role: 'DOCTOR',
    is_active: true,
    is_approved: true,
  },
  {
    id: 3,
    email: 'patient@demo.com',
    password: 'demopass123',
    first_name: 'John',
    last_name: 'Doe',
    role: 'PATIENT',
    is_active: true,
    is_approved: true,
  },
  {
    id: 4,
    email: 'mark.johnson@hospital.com',
    password: 'docpass456',
    first_name: 'Mark',
    last_name: 'Johnson',
    role: 'DOCTOR',
    is_active: true,
    is_approved: true,
  },
  {
    id: 5,
    email: 'emily.davis@hospital.com',
    password: 'docpass789',
    first_name: 'Emily',
    last_name: 'Davis',
    role: 'DOCTOR',
    is_active: true,
    is_approved: true,
  },
  {
    id: 6,
    email: 'jane.smith@email.com',
    password: 'patientpass',
    first_name: 'Jane',
    last_name: 'Smith',
    role: 'PATIENT',
    is_active: true,
    is_approved: true,
  },
];

// ==========================
// Doctors
// ==========================

export const mockDoctors: Doctor[] = [
  {
    id: 1,
    user_id: 2,
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@hospital.com',
    specialty: 'Cardiology',
    bio: 'Board-certified cardiologist with 12 years of experience in interventional cardiology. Specializes in preventive cardiac care and minimally invasive procedures.',
    image_url: 'https://i.pravatar.cc/150?u=sarah',
    is_active: true,
  },
  {
    id: 2,
    user_id: 4,
    name: 'Dr. Mark Johnson',
    email: 'mark.johnson@hospital.com',
    specialty: 'Dermatology',
    bio: 'Expert dermatologist with 8 years of clinical practice. Focuses on skin cancer screening, acne treatment, and cosmetic dermatology.',
    image_url: 'https://i.pravatar.cc/150?u=mark',
    is_active: true,
  },
  {
    id: 3,
    user_id: 5,
    name: 'Dr. Emily Davis',
    email: 'emily.davis@hospital.com',
    specialty: 'Neurology',
    bio: 'Neurologist specializing in movement disorders and neurodegenerative diseases. Research focus on early diagnosis of Parkinson disease.',
    image_url: 'https://i.pravatar.cc/150?u=emily',
    is_active: true,
  },
  {
    id: 4,
    user_id: 6,
    name: 'Dr. Michael Rodriguez',
    email: 'michael.r@hospital.com',
    specialty: 'Pediatrics',
    bio: 'Compassionate pediatrician with 15 years of experience. Board-certified in pediatric emergency medicine and newborn care.',
    image_url: 'https://i.pravatar.cc/150?u=michael',
    is_active: true,
  },
  {
    id: 5,
    user_id: 7,
    name: 'Dr. Lisa Wang',
    email: 'lisa.wang@hospital.com',
    specialty: 'Orthopedics',
    bio: 'Orthopedic surgeon specializing in sports medicine and joint replacement. Former team physician for professional athletes.',
    image_url: 'https://i.pravatar.cc/150?u=lisa',
    is_active: true,
  },
  {
    id: 6,
    user_id: 8,
    name: 'Dr. James Wilson',
    email: 'james.wilson@hospital.com',
    specialty: 'General Practice',
    bio: 'Family physician providing comprehensive primary care. Emphasizes preventive medicine and chronic disease management.',
    image_url: 'https://i.pravatar.cc/150?u=james',
    is_active: true,
  },
  {
    id: 7,
    user_id: 9,
    name: 'Dr. Aisha Patel',
    email: 'aisha.patel@hospital.com',
    specialty: 'Cardiology',
    bio: 'Interventional cardiologist with expertise in electrophysiology. Published researcher on arrhythmia management techniques.',
    image_url: 'https://i.pravatar.cc/150?u=aisha',
    is_active: true,
  },
  {
    id: 8,
    user_id: 10,
    name: 'Dr. Robert Kim',
    email: 'robert.kim@hospital.com',
    specialty: 'Neurology',
    bio: 'Neurosurgeon with fellowship training in cerebrovascular surgery. Expert in treating brain aneurysms and stroke prevention.',
    image_url: 'https://i.pravatar.cc/150?u=robert',
    is_active: true,
  },
  {
    id: 9,
    user_id: 11,
    name: 'Dr. Maria Garcia',
    email: 'maria.garcia@hospital.com',
    specialty: 'Dermatology',
    bio: 'Dermatopathologist combining clinical and laboratory expertise. Specializes in inflammatory skin diseases and melanoma diagnosis.',
    image_url: 'https://i.pravatar.cc/150?u=maria',
    is_active: true,
  },
  {
    id: 10,
    user_id: 12,
    name: 'Dr. David Thompson',
    email: 'david.t@hospital.com',
    specialty: 'Orthopedics',
    bio: 'Spine surgeon with advanced training in minimally invasive techniques. Dedicated to improving quality of life for patients with back pain.',
    image_url: 'https://i.pravatar.cc/150?u=david',
    is_active: true,
  },
];

// ==========================
// Appointments
// ==========================

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    doctor: mockDoctors[0],
    date: '2026-01-22',
    time: '09:00',
    status: 'CONFIRMED',
    notes: null,
    created_at: '2026-01-15T10:30:00Z',
  },
  {
    id: 2,
    doctor: mockDoctors[1],
    date: '2026-01-25',
    time: '14:00',
    status: 'PENDING',
    notes: null,
    created_at: '2026-01-18T09:15:00Z',
  },
  {
    id: 3,
    doctor: mockDoctors[2],
    date: '2026-01-20',
    time: '10:30',
    status: 'COMPLETED',
    notes: 'Follow-up recommended in 3 months.',
    created_at: '2026-01-10T11:00:00Z',
  },
  {
    id: 4,
    doctor: mockDoctors[0],
    date: '2026-02-05',
    time: '15:30',
    status: 'PENDING',
    notes: null,
    created_at: '2026-01-19T16:45:00Z',
  },
  {
    id: 5,
    doctor: mockDoctors[3],
    date: '2026-01-18',
    time: '11:00',
    status: 'CANCELLED',
    notes: 'Patient rescheduled.',
    created_at: '2026-01-12T08:20:00Z',
  },
];

// ==========================
// Availability
// ==========================

export const mockAvailability: AvailabilitySlot[] = [
  // Dr. Sarah Chen (id: 1) - Jan 20-24
  { id: 1, doctor_id: 1, date: '2026-01-20', start_time: '09:00', end_time: '10:00', is_booked: false },
  { id: 2, doctor_id: 1, date: '2026-01-20', start_time: '10:30', end_time: '11:30', is_booked: false },
  { id: 3, doctor_id: 1, date: '2026-01-20', start_time: '14:00', end_time: '15:00', is_booked: false },
  { id: 4, doctor_id: 1, date: '2026-01-21', start_time: '09:00', end_time: '10:00', is_booked: false },
  { id: 5, doctor_id: 1, date: '2026-01-21', start_time: '11:00', end_time: '12:00', is_booked: false },
  { id: 6, doctor_id: 1, date: '2026-01-22', start_time: '09:00', end_time: '10:00', is_booked: true },
  { id: 7, doctor_id: 1, date: '2026-01-22', start_time: '10:30', end_time: '11:30', is_booked: false },
  { id: 8, doctor_id: 1, date: '2026-01-22', start_time: '14:00', end_time: '15:00', is_booked: true },
  { id: 9, doctor_id: 1, date: '2026-01-23', start_time: '09:00', end_time: '10:00', is_booked: false },
  { id: 10, doctor_id: 1, date: '2026-01-23', start_time: '15:00', end_time: '16:00', is_booked: false },
  { id: 11, doctor_id: 1, date: '2026-01-24', start_time: '10:00', end_time: '11:00', is_booked: false },

  // Dr. Mark Johnson (id: 2) - Jan 20-24
  { id: 12, doctor_id: 2, date: '2026-01-20', start_time: '09:00', end_time: '10:00', is_booked: false },
  { id: 13, doctor_id: 2, date: '2026-01-20', start_time: '11:00', end_time: '12:00', is_booked: false },
  { id: 14, doctor_id: 2, date: '2026-01-21', start_time: '14:00', end_time: '15:00', is_booked: false },
  { id: 15, doctor_id: 2, date: '2026-01-22', start_time: '09:00', end_time: '10:00', is_booked: false },
  { id: 16, doctor_id: 2, date: '2026-01-23', start_time: '10:00', end_time: '11:00', is_booked: false },
  { id: 17, doctor_id: 2, date: '2026-01-24', start_time: '14:00', end_time: '15:00', is_booked: true },

  // Dr. Emily Davis (id: 3) - Jan 20-24
  { id: 18, doctor_id: 3, date: '2026-01-20', start_time: '10:00', end_time: '11:00', is_booked: true },
  { id: 19, doctor_id: 3, date: '2026-01-21', start_time: '09:00', end_time: '10:00', is_booked: false },
  { id: 20, doctor_id: 3, date: '2026-01-21', start_time: '11:00', end_time: '12:00', is_booked: false },
  { id: 21, doctor_id: 3, date: '2026-01-22', start_time: '14:00', end_time: '15:00', is_booked: false },
  { id: 22, doctor_id: 3, date: '2026-01-23', start_time: '09:00', end_time: '10:00', is_booked: false },
];

// ==========================
// Admin Stats
// ==========================

export const mockAdminStats = {
  totalUsers: mockUsers.length,
  totalDoctors: mockDoctors.length,
  totalAppointments: mockAppointments.length,
  pendingApprovals: mockUsers.filter((u) => u.role === 'DOCTOR' && !u.is_approved).length,
};
