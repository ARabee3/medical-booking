import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctors,
  getDoctorById,
  getDoctorAvailability,
  getDoctorSlots,
  getDoctorByUserId,
  updateDoctor,
  addAvailability,
  deleteAvailability,
} from '@/lib/mockApi';
import { useAuth } from '@/context/AuthContext';
import type { AvailabilitySlot, Doctor } from '@/types/global';

export const useDoctors = (specialty?: string) => {
  return useQuery({
    queryKey: ['doctors', specialty],
    queryFn: () => getDoctors(specialty),
  });
};

export const useDoctor = (id: number) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => getDoctorById(id),
    enabled: !!id,
  });
};

export const useDoctorAvailability = (doctorId: number, date: string) => {
  return useQuery({
    queryKey: ['availability', doctorId, date],
    queryFn: () => getDoctorAvailability(doctorId, date),
    enabled: !!doctorId && !!date,
  });
};

export const useDoctorSlots = (doctorId: number) => {
  return useQuery<AvailabilitySlot[]>({
    queryKey: ['doctor-slots', doctorId],
    queryFn: () => getDoctorSlots(doctorId),
    enabled: !!doctorId,
  });
};

export const useCurrentDoctor = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['doctor', 'me', user?.id],
    queryFn: () => getDoctorByUserId(user!.id),
    enabled: !!user && user.role === 'DOCTOR',
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Doctor> }) =>
      updateDoctor(id, updates),
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
    mutationFn: (slot: Omit<AvailabilitySlot, 'id'>) => addAvailability(slot),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['doctor-slots', variables.doctor_id],
      });
    },
  });
};

export const useDeleteSlot = (doctorId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteAvailability(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['doctor-slots', doctorId],
      });
    },
  });
};
