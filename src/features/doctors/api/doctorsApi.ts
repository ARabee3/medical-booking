import { useQuery } from '@tanstack/react-query';
import { getDoctors, getDoctorById, getDoctorAvailability } from '@/lib/mockApi';

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
