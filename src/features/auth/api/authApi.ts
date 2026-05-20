import { useQuery } from '@tanstack/react-query';
import { login, register, refreshToken } from '@/lib/mockApi';
import type { LoginRequest, RegisterRequest } from '@/types/global';

export const useLogin = () => {
  return {
    mutate: login,
  };
};

export const useRegister = () => {
  return {
    mutate: register,
  };
};

export const useRefreshToken = () => {
  return {
    mutate: refreshToken,
  };
};
