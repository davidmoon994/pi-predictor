// lib/store/klineStore.ts
//K线数据全局监听（自动获取最新一条数据），用于存行情数据+使用方法设置。
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
  setHistory: (data: KlineItem[]) => void;
  setLatest: (data: KlineItem) => void;
  addLatestKline: (data: KlineItem) => void;
  klineData: KlineItem[]; // 合并后的 getter
}

export const useKlineStore = create<KlineState>()(
  persist(
    (set, get) => ({
      history: [],
      latest: null,

      setHistory: (data) => set({ history: data }),
      setLatest: (data) => set({ latest: data }),

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

      get klineData() {
        const { history, latest } = get();
        return latest ? [...history, latest] : history;
      },
    }),
    { name: 'kline-storage' }
  )
);
