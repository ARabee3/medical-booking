import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import type { AvailabilitySlot, Doctor, DoctorImage, DoctorImageKind } from '@/types/global';

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

export interface DoctorAvailabilitySlot {
  time: string;
  price: string | null;
}

const fetchDoctorAvailability = async (
  doctorId: number,
  date: string
): Promise<{ doctor_id: number; date: string; slots: DoctorAvailabilitySlot[] }> => {
  const { data } = await api.get(`/doctors/${doctorId}/availability/`, {
    params: { date },
  });
  return data;
};

type AvailabilitySummary = {
  doctor_id: number;
  from: string;
  to: string;
  slots_by_date: Record<string, number>;
  total: number;
};

const fetchAvailabilitySummary = async (
  doctorId: number,
  from: string,
  to: string
): Promise<AvailabilitySummary> => {
  const { data } = await api.get(`/doctors/${doctorId}/availability/summary/`, {
    params: { from, to },
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
// Image upload API functions
// ---------------------------------------------------------------------------

const fetchDoctorImages = async (
  doctorId: number,
  kind?: DoctorImageKind
): Promise<DoctorImage[]> => {
  const params: Record<string, string> = {};
  if (kind) params.kind = kind;
  const { data } = await api.get(`/doctors/${doctorId}/images/`, {
    params: Object.keys(params).length ? params : undefined,
  });
  return data;
};

const fetchOwnImages = async (kind?: DoctorImageKind): Promise<DoctorImage[]> => {
  const params: Record<string, string> = {};
  if (kind) params.kind = kind;
  const { data } = await api.get('/doctors/me/images/', {
    params: Object.keys(params).length ? params : undefined,
  });
  return data;
};

const uploadImage = async (formData: FormData): Promise<DoctorImage> => {
  const { data } = await api.post('/doctors/me/images/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const updateImage = async (
  id: number,
  updates: { caption?: string; order?: number }
): Promise<DoctorImage> => {
  const { data } = await api.patch(`/doctors/me/images/${id}/`, updates);
  return data;
};

const deleteImage = async (id: number): Promise<void> => {
  await api.delete(`/doctors/me/images/${id}/`);
};

const uploadAvatar = async (file: File): Promise<Doctor> => {
  const formData = new FormData();
  formData.append('image', file);
  const { data } = await api.post('/doctors/me/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const deleteAvatar = async (): Promise<Doctor> => {
  const { data } = await api.delete('/doctors/me/avatar/delete/');
  return data;
};

const updateDoctorProfile = async (_id: number, updates: Partial<Doctor>): Promise<Doctor> => {
  const { data } = await api.patch('/doctors/me/update/', updates);
  return data;
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

export const useAvailabilitySummary = (doctorId: number, from: string, to: string) => {
  return useQuery({
    queryKey: ['availability-summary', doctorId, from, to],
    queryFn: () => fetchAvailabilitySummary(doctorId, from, to),
    enabled: !!doctorId && !!from && !!to,
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

// ---------------------------------------------------------------------------
// Image management hooks
// ---------------------------------------------------------------------------

export const useDoctorImages = (doctorId: number, kind?: DoctorImageKind) => {
  return useQuery({
    queryKey: ['doctor-images', doctorId, kind],
    queryFn: () => fetchDoctorImages(doctorId, kind),
    enabled: !!doctorId,
  });
};

export const useOwnImages = (kind?: DoctorImageKind) => {
  return useQuery({
    queryKey: ['own-images', kind],
    queryFn: () => fetchOwnImages(kind),
  });
};

export const useUploadImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => uploadImage(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-images'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: { caption?: string; order?: number } }) =>
      updateImage(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-images'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['own-images'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useUpdateDoctorProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Doctor> }) =>
      updateDoctorProfile(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};
