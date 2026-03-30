import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  userId: string | null
  email: string | null
  name: string | null
  avatar: string | null
  token: string | null
  isAuthenticated: boolean
  login: (data: { userId: string; email: string; name: string; avatar: string | null; token: string }) => void
  logout: () => void
  updateProfile: (data: Partial<Pick<AuthState, 'name' | 'avatar'>>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      name: null,
      avatar: null,
      token: null,
      isAuthenticated: false,
      login: (data) => set({
        userId: data.userId,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        token: data.token,
        isAuthenticated: true,
      }),
      logout: () => set({
        userId: null,
        email: null,
        name: null,
        avatar: null,
        token: null,
        isAuthenticated: false,
      }),
      updateProfile: (data) => set((state) => ({
        ...state,
        ...data,
      })),
    }),
    {
      name: 'amori-auth',
      partialize: (state) => ({
        userId: state.userId,
        email: state.email,
        name: state.name,
        avatar: state.avatar,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
