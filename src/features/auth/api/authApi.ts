import { api } from '@/lib/api';
import type { LoginRequest, RegisterRequest } from '@/types/global';

export const useLogin = () => {
  return {
    mutate: async (credentials: LoginRequest) => {
      const { data } = await api.post('/token/', credentials);
      return data;
    },
  };
};

export const useRegister = () => {
  return {
    mutate: async (request: RegisterRequest) => {
      const { data } = await api.post('/register/', request);
      return data;
    },
  };
};
