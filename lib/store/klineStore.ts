// lib/store/klineStore.ts
//K线数据全局监听（自动获取最新一条数据），用于存行情数据+使用方法设置。
// lib/store/klineStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface KlineItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closed: boolean;
  periodNumber: number;
  readableTime: string;
}

interface KlineState {
  history: KlineItem[];
  latest: KlineItem | null;
  hasFetched: boolean;
  setHistory: (data: KlineItem[]) => void;
  setLatest: (data: KlineItem) => void;
  addLatestKline: (data: KlineItem) => void;
  setHasFetched: (fetched: boolean) => void;
  getKlineData: () => KlineItem[];
}

export const useKlineStore = create<KlineState>()(
  persist(
    (set, get) => ({
      history: [],
      latest: null,
      hasFetched: false,

      setHistory: (data) => set({ history: data }),
      setLatest: (data) => set({ latest: data }),
      setHasFetched: (fetched) => set({ hasFetched: fetched }),

      addLatestKline: (data) => {
        const history = get().history;
        const updated = [...history];

        if (!updated.length || updated[updated.length - 1].closed) {
          updated.push(data);
        } else {
          updated[updated.length - 1] = data;
        }

        set({ history: updated });
      },

      getKlineData: () => {
        const { history, latest } = get();
        return latest ? [...history, latest] : history;
      },
      
    }),
    {
      name: 'kline-storage',
      partialize: (state) => ({
        history: state.history,
        latest: state.latest,
        hasFetched: state.hasFetched,
      }),
    }
  )
);
