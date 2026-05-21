import {
  Doctor,
  User,
  Appointment,
  AvailabilitySlot,
  LoginRequest,
  RegisterRequest,
  BookingRequest,
  AppointmentStatus,
  JWTPair,
} from '@/types/global';
import {
  mockDoctors,
  mockUsers,
  mockAppointments,
  mockAvailability,
  mockAdminStats,
} from '@/mocks/data';

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

// ==========================
// Auth
// ==========================

export const login = async (
  credentials: LoginRequest
): Promise<{ user: User; access: string; refresh: string }> => {
  await delay(300);
  const user = mockUsers.find(
    (u) => u.email === credentials.email && u.password === credentials.password
  );
  if (!user) {
    throw new Error('No active account found with the given credentials');
  }
  return {
    user: { ...user, password: undefined },
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
  };
};

export const register = async (
  request: RegisterRequest
): Promise<{ user: User; access: string; refresh: string }> => {
  await delay(400);
  const existing = mockUsers.find((u) => u.email === request.email);
  if (existing) {
    throw Object.assign(new Error('User with this email already exists.'), {
      fieldErrors: { email: ['User with this email already exists.'] },
    });
  }
  if (request.password !== request.password_confirm) {
    throw Object.assign(new Error('Passwords do not match.'), {
      fieldErrors: { password: ['Passwords do not match.'] },
    });
  }

  const newUser: User = {
    id: mockUsers.length + 1,
    email: request.email,
    password: request.password,
    first_name: request.first_name,
    last_name: request.last_name,
    role: request.role,
    is_active: true,
    is_approved: request.role === 'PATIENT',
  };
  mockUsers.push(newUser);

  return {
    user: { ...newUser, password: undefined },
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
  };
};

export const refreshToken = async (refresh: string): Promise<JWTPair> => {
  await delay(200);
  if (refresh !== 'mock-refresh-token') {
    throw new Error('Token is invalid or expired');
  }
  return {
    access: 'mock-access-token-refreshed',
    refresh: 'mock-refresh-token',
  };
};

// ==========================
// Doctors
// ==========================

export const getDoctors = async (specialty?: string): Promise<Doctor[]> => {
  await delay(400);
  let data = [...mockDoctors];
  if (specialty) {
    data = data.filter((d) => d.specialty === specialty);
  }
  return data;
};

export const getDoctorById = async (id: number): Promise<Doctor> => {
  await delay(300);
  const doctor = mockDoctors.find((d) => d.id === id);
  if (!doctor) throw new Error('Doctor not found');
  return doctor;
};

export const getDoctorAvailability = async (doctorId: number, date: string): Promise<string[]> => {
  await delay(200);
  const slots = mockAvailability.filter(
    (a) => a.doctor_id === doctorId && a.date === date && !a.is_booked
  );
  return slots.map((s) => s.start_time);
};

export const getDoctorSlots = async (doctorId: number): Promise<AvailabilitySlot[]> => {
  await delay(200);
  return mockAvailability.filter((a) => a.doctor_id === doctorId);
};
// ==========================
// Appointments (Patient)
// ==========================

export const getAppointments = async (): Promise<Appointment[]> => {
  await delay(300);
  return [...mockAppointments];
};

export const bookAppointment = async (request: BookingRequest): Promise<Appointment> => {
  await delay(500);
  const doctor = mockDoctors.find((d) => d.id === request.doctor_id);
  if (!doctor) throw new Error('Doctor not found');

  const existing = mockAppointments.find(
    (a) =>
      a.doctor.id === request.doctor_id &&
      a.date === request.date &&
      a.time === request.time &&
      a.status !== 'CANCELLED'
  );
  if (existing) {
    throw Object.assign(new Error('This time slot is already booked'), {
      fieldErrors: { time: ['This time slot is no longer available.'] },
    });
  }

  const appointment: Appointment = {
    id: mockAppointments.length + 1,
    doctor,
    date: request.date,
    time: request.time,
    status: 'PENDING',
    notes: null,
    created_at: new Date().toISOString(),
  };
  mockAppointments.push(appointment);

  // Mark availability as booked
  const slot = mockAvailability.find(
    (a) =>
      a.doctor_id === request.doctor_id && a.date === request.date && a.start_time === request.time
  );
  if (slot) slot.is_booked = true;

  return appointment;
};

export const updateAppointment = async (
  id: number,
  updates: Partial<Pick<Appointment, 'status' | 'date' | 'time'>>
): Promise<Appointment> => {
  await delay(300);
  const appointment = mockAppointments.find((a) => a.id === id);
  if (!appointment) throw new Error('Appointment not found');

  if (updates.status) appointment.status = updates.status;
  if (updates.date) appointment.date = updates.date;
  if (updates.time) appointment.time = updates.time;

  return appointment;
};

// ==========================
// Doctor Endpoints
// ==========================

export const getDoctorAppointments = async (): Promise<Appointment[]> => {
  await delay(300);
  return mockAppointments.filter((a) => a.doctor.id === 2); // Mock: doctor with id 2
};

export const updateDoctorAppointment = async (
  id: number,
  updates: { status?: AppointmentStatus; notes?: string }
): Promise<Appointment> => {
  await delay(300);
  const appointment = mockAppointments.find((a) => a.id === id);
  if (!appointment) throw new Error('Appointment not found');

  if (updates.status) appointment.status = updates.status;
  if (updates.notes !== undefined) appointment.notes = updates.notes;

  return appointment;
};

export const addAvailability = async (
  slot: Omit<AvailabilitySlot, 'id'>
): Promise<AvailabilitySlot> => {
  await delay(300);
  const newSlot: AvailabilitySlot = {
    ...slot,
    id: mockAvailability.length + 1,
  };
  mockAvailability.push(newSlot);
  return newSlot;
};

export const deleteAvailability = async (id: number): Promise<void> => {
  await delay(200);
  const index = mockAvailability.findIndex((a) => a.id === id);
  if (index === -1) throw new Error('Slot not found');
  if (mockAvailability[index].is_booked) {
    throw new Error('Cannot delete a slot that is already booked');
  }
  mockAvailability.splice(index, 1);
};

// ==========================
// Admin Endpoints
// ==========================

export const getAdminUsers = async (): Promise<User[]> => {
  await delay(300);
  return mockUsers.map((u) => ({ ...u, password: undefined }));
};

export const updateAdminUser = async (id: number, updates: Partial<User>): Promise<User> => {
  await delay(200);
  const user = mockUsers.find((u) => u.id === id);
  if (!user) throw new Error('User not found');

  Object.assign(user, updates);
  return { ...user, password: undefined };
};

export const getAdminAppointments = async (): Promise<Appointment[]> => {
  await delay(300);
  return [...mockAppointments];
};

export const getAdminStats = async (): Promise<{
  totalUsers: number;
  totalDoctors: number;
  totalAppointments: number;
  pendingApprovals: number;
}> => {
  await delay(200);
  return mockAdminStats;
};
