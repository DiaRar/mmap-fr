import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest, setAuthTokenProvider, setUnauthorizedHandler } from '@/lib/api';
import { type LoginResponse, type User } from '@/features/dashboard/types';
import { LoginSchema, RegisterSchema } from '../schemas';
import { z } from 'zod';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (data: z.infer<typeof LoginSchema>) => Promise<void>;
  register: (data: z.infer<typeof RegisterSchema>) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiRequest<LoginResponse>('/auth/token', {
            method: 'POST',
            body: JSON.stringify({ email: data.email, password: data.password }),
          });
          
          set({ token: response.access_token, isAuthenticated: true });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message || 'Failed to login' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
           // First register
           await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                first_name: data.fullName.split(' ')[0],
                last_name: data.fullName.split(' ').slice(1).join(' '),
                // Assuming test_id is optional or not needed for now
            }),
          });

          // Then login automatically
          await get().login({ email: data.email, password: data.password });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          set({ error: err.message || 'Failed to register' });
          throw err;
        } finally {
            set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated, user: state.user }),
    }
  )
);

setAuthTokenProvider(() => useAuthStore.getState().token);
setUnauthorizedHandler(() => {
  const { logout } = useAuthStore.getState();
  logout();
});
