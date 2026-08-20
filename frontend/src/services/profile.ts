import api from './api';

export interface UserProfile {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  role?: {
    id: number;
    name: string;
  };
}

export const getProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (data: { full_name?: string; email?: string }): Promise<UserProfile> => {
  const response = await api.put('/auth/profile', data);
  return response.data;
};

export const changePassword = async (data: { current_password: string; new_password: string }): Promise<{ message: string }> => {
  const response = await api.put('/auth/change-password', data);
  return response.data;
};
