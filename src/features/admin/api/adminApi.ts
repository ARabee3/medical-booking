import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, getAdminAppointments, getAdminStats, updateAdminUser } from '@/lib/mockApi';
import type { User } from '@/types/global';

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });
};

export const useAdminAppointments = () => {
  return useQuery({
    queryKey: ['admin-appointments'],
    queryFn: getAdminAppointments,
  });
};

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });
};

export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<User> }) =>
      updateAdminUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
};
