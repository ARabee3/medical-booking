import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { AvailabilitySlot, Doctor } from '@/types/global';

// Type for the POST payload — doctor_id is assigned by backend from JWT
type AddSlotPayload = Omit<AvailabilitySlot, 'id' | 'is_booked' | 'doctor_id'>;

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const fetchDoctors = async (specialty?: string, search?: string): Promise<Doctor[]> => {
  const params: Record<string, string> = {};
  if (specialty) params.specialty = specialty;
  if (search) params.search = search;

  const { data } = await api.get('/doctors/', {
    params: Object.keys(params).length ? params : undefined,
  });
  return data.results ?? data;
};

const fetchDoctorById = async (id: number): Promise<Doctor> => {
  const { data } = await api.get(`/doctors/${id}/`);
  return data;
};

const fetchDoctorAvailability = async (
  doctorId: number,
  date: string
): Promise<{ doctor_id: number; date: string; slots: string[] }> => {
  const { data } = await api.get(`/doctors/${doctorId}/availability/`, {
    params: { date },
  });
  return data;
};

const fetchDoctorSlots = async (doctorId: number): Promise<AvailabilitySlot[]> => {
  const { data } = await api.get('/doctor/availability/', {
    params: { doctor_id: doctorId },
  });
  return data.results ?? data;
};

const fetchCurrentDoctor = async (): Promise<Doctor> => {
  const { data } = await api.get('/doctors/me/');
  return data;
};

const patchDoctor = async (id: number, updates: Partial<Doctor>): Promise<Doctor> => {
  const { data } = await api.patch(`/doctors/${id}/`, updates);
  return data;
};

const postAvailabilitySlot = async (slot: AddSlotPayload): Promise<AvailabilitySlot> => {
  const { data } = await api.post('/doctor/availability/', slot);
  return data;
};

const deleteAvailabilitySlot = async (id: number): Promise<void> => {
  await api.delete(`/doctor/availability/${id}/`);
};

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

export const useDoctors = (specialty?: string, search?: string) => {
  return useQuery({
    queryKey: ['doctors', specialty, search],
    queryFn: () => fetchDoctors(specialty, search),
  });
};

export const useDoctor = (id: number) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => fetchDoctorById(id),
    enabled: !!id,
  });
};

export const useDoctorAvailability = (doctorId: number, date: string) => {
  return useQuery({
    queryKey: ['availability', doctorId, date],
    queryFn: () => fetchDoctorAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
  });
};

export const useDoctorSlots = (doctorId: number) => {
  return useQuery<AvailabilitySlot[]>({
    queryKey: ['doctor-slots', doctorId],
    queryFn: () => fetchDoctorSlots(doctorId),
    enabled: !!doctorId,
  });
};

export const useCurrentDoctor = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doctor', 'me', user?.id],
    queryFn: fetchCurrentDoctor,
    enabled: !!user && user.role === 'DOCTOR',
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Doctor> }) =>
      patchDoctor(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useAddSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slot: AddSlotPayload) => postAvailabilitySlot(slot),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['doctor-slots', data.doctor_id],
      });
    },
  });
};

export const useDeleteSlot = (doctorId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAvailabilitySlot(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['doctor-slots', doctorId],
      });
    },
  });
};
