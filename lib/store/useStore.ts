// lib/store/useStore.ts
//全局监听注册和登录账户数据，用于存数据+使用方法设置。

import { create } from 'zustand';
import { UserData } from '../types';

interface UserState {
  user: UserData | null;
  points: number;           // 独立积分状态
  setUser: (user: UserData) => void;
  clearUser: () => void;
  updatePoints: (points: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  points: 0,
  setUser: (user) => set({ user, points: user.points ?? 0 }),
  clearUser: () => set({ user: null, points: 0 }),
  updatePoints: (points) =>
    set((state) =>
      state.user
        ? { user: { ...state.user, points }, points }
        : state
    ),
}));
