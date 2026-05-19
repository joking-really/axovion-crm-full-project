import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tenantId');
    set({ user: null });
  },
}));
