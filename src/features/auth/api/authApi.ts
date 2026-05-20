import { login as mockLogin, register as mockRegister } from '@/lib/mockApi';

export const useLogin = () => {
  return {
    mutate: mockLogin,
  };
};

export const useRegister = () => {
  return {
    mutate: mockRegister,
  };
};
