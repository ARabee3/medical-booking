import { useQuery } from '@tanstack/react-query';
import { getAdminUsers, getAdminAppointments, getAdminStats } from '@/lib/mockApi';

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
