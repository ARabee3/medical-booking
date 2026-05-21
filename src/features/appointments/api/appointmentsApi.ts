import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointments,
  bookAppointment,
  updateAppointment,
  getDoctorAppointments,
  updateDoctorAppointment,
} from '@/lib/mockApi';
import type { BookingRequest, Appointment, AppointmentStatus } from '@/types/global';

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
  });
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: BookingRequest) => bookAppointment(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => updateAppointment(id, { status: 'CANCELLED' }),
    onMutate: async (id: number) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['appointments'] });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData<Appointment[]>(['appointments']);

      // Optimistically update to the new value
      if (previousAppointments) {
        queryClient.setQueryData<Appointment[]>(
          ['appointments'],
          previousAppointments.map((appt) =>
            appt.id === id ? { ...appt, status: 'CANCELLED' } : appt
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousAppointments };
    },
    onError: (_err, _id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, time }: { id: number; date: string; time: string }) =>
      updateAppointment(id, { date, time }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

// ==========================================
// Doctor Endpoints
// ==========================================

export const useDoctorAppointments = () => {
  return useQuery({
    queryKey: ['doctorAppointments'],
    queryFn: getDoctorAppointments,
  });
};

export const useUpdateDoctorAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: { status?: AppointmentStatus; notes?: string };
    }) => updateDoctorAppointment(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ['doctorAppointments'] });

      const previousAppointments = queryClient.getQueryData<Appointment[]>(['doctorAppointments']);

      if (previousAppointments) {
        queryClient.setQueryData<Appointment[]>(
          ['doctorAppointments'],
          previousAppointments.map((appt) => (appt.id === id ? { ...appt, ...updates } : appt))
        );
      }

      return { previousAppointments };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(['doctorAppointments'], context.previousAppointments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
    },
  });
};
