import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Review } from '@/types/global';

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const createReview = async (
  appointmentId: number,
  data: { rating: number; comment: string }
): Promise<Review> => {
  const { data: response } = await api.post(`/appointments/${appointmentId}/review/create/`, data);
  return response;
};

const getAppointmentReview = async (appointmentId: number): Promise<Review> => {
  const { data } = await api.get(`/appointments/${appointmentId}/review/`);
  return data;
};

const updateReview = async (
  reviewId: number,
  data: { rating: number; comment: string }
): Promise<Review> => {
  const { data: response } = await api.patch(`/reviews/${reviewId}/`, data);
  return response;
};

const deleteReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/reviews/${reviewId}/`);
};

const getDoctorReviews = async (doctorId: number): Promise<Review[]> => {
  const { data } = await api.get(`/doctors/${doctorId}/reviews/`);
  return data;
};

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      data,
    }: {
      appointmentId: number;
      data: { rating: number; comment: string };
    }) => createReview(appointmentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointment-review', variables.appointmentId] });
      queryClient.invalidateQueries({ queryKey: ['doctor-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useAppointmentReview = (appointmentId: number) => {
  return useQuery({
    queryKey: ['appointment-review', appointmentId],
    queryFn: () => getAppointmentReview(appointmentId),
    enabled: !!appointmentId,
    retry: false,
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: { rating: number; comment: string };
    }) => updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-review'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointment-review'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['doctor'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
};

export const useDoctorReviews = (doctorId: number) => {
  return useQuery({
    queryKey: ['doctor-reviews', doctorId],
    queryFn: () => getDoctorReviews(doctorId),
    enabled: !!doctorId,
  });
};
