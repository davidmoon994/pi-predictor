// lib/store/usePeriodStore.ts
//期数全局监听，主要用于往期已经开奖和已经结算的PastCard；存情数据+使用方法设置。
// lib/store/usePeriodStore.ts

import { create } from 'zustand';

export interface PeriodData {
  periodNumber: number;
  readableTime: string;
  open: number;
  close: number;
  high: number;
  low: number;
  poolAmount: number;
  upAmount: number;
  downAmount: number;
  riseFallRatio: string;
}

interface PeriodStore {
  history: PeriodData[];
  addPeriodData: (data: Omit<PeriodData, 'riseFallRatio'>) => void;
}

export const usePeriodStore = create<PeriodStore>((set) => ({
  history: [],
  addPeriodData: (data) =>
    set((state) => {
      const up = data.upAmount;
      const down = data.downAmount;
      const ratio =
        up + down === 0
          ? '0:0'
          : `${((up / (up + down)) * 100).toFixed(1)}% : ${((down / (up + down)) * 100).toFixed(1)}%`;

      const newItem: PeriodData = { ...data, riseFallRatio: ratio };

      // 保留最近 10 期
      const updated = [newItem, ...state.history].slice(0, 10);

      return { history: updated };
    }),
}));
