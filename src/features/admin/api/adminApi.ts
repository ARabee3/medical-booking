import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AdminStats, AdminUser, AdminAppointment } from '@/features/admin/types';

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

const fetchAdminUsers = async (params?: {
  role?: string;
  is_active?: boolean;
  is_approved?: boolean;
  search?: string;
}): Promise<AdminUser[]> => {
  const { data } = await api.get('/admin/users/', { params });
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchAdminAppointments = async (params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}): Promise<AdminAppointment[]> => {
  const { data } = await api.get('/admin/appointments/', { params });
  return Array.isArray(data) ? data : (data.results ?? []);
};

const fetchAdminStats = async (): Promise<AdminStats> => {
  const { data } = await api.get('/admin/stats/');
  return data;
};

const patchAdminUser = async (
  id: number,
  updates: { is_active?: boolean; is_approved?: boolean }
): Promise<AdminUser> => {
  const { data } = await api.patch(`/admin/users/${id}/`, updates);
  return data;
};

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

export const useAdminUsers = (params?: {
  role?: string;
  is_active?: boolean;
  is_approved?: boolean;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => fetchAdminUsers(params),
  });
};

export const useAdminAppointments = (params?: {
  status?: string;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ['admin-appointments', params],
    queryFn: () => fetchAdminAppointments(params),
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: number;
      updates: { is_active?: boolean; is_approved?: boolean };
    }) => patchAdminUser(id, updates),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};
