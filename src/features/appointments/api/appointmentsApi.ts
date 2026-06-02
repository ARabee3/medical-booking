import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { BookingRequest, Appointment, AppointmentStatus } from '@/types/global';

// ==========================================
// Real API functions (replacing mockApi)
// These call the Django backend directly.
// ==========================================

const getAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get('/appointments/');
  // Django StandardResultsSetPagination returns { count, results, ... }
  return data.results ?? data;
};

const bookAppointment = async (request: BookingRequest): Promise<Appointment> => {
  const { data } = await api.post('/appointments/', request);
  return data;
};

const updateAppointment = async (
  id: number,
  updates: { status?: AppointmentStatus; date?: string; time?: string }
): Promise<Appointment> => {
  const { data } = await api.patch(`/appointments/${id}/`, updates);
  return data;
};

const getDoctorAppointments = async (): Promise<Appointment[]> => {
  const { data } = await api.get('/doctor/appointments/');
  // Django StandardResultsSetPagination returns { count, results, ... }
  return data.results ?? data;
};

const updateDoctorAppointment = async (
  id: number,
  updates: { status?: AppointmentStatus; notes?: string }
): Promise<Appointment> => {
  const { data } = await api.patch(`/doctor/appointments/${id}/`, updates);
  return data;
};

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
    onMutate: async ({ id, date, time }) => {
      await queryClient.cancelQueries({ queryKey: ['appointments'] });

      const previousAppointments = queryClient.getQueryData<Appointment[]>(['appointments']);

      if (previousAppointments) {
        queryClient.setQueryData<Appointment[]>(
          ['appointments'],
          previousAppointments.map((appt) => (appt.id === id ? { ...appt, date, time } : appt))
        );
      }

      return { previousAppointments };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(['appointments'], context.previousAppointments);
      }
    },
    onSettled: () => {
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
