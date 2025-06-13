// lib/store/klineStore.ts
//K线数据全局监听（自动获取最新一条数据），用于存行情数据+使用方法设置。
import { create } from 'zustand';

type KlineItem = {
  timestamp: number;       // 秒级时间戳
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
  isClosed: boolean;
};

type CurrentPrices = {
  open: number;
  close: number;
  high: number;
  low: number;
};

type KlineState = {
  klineData: KlineItem[];
  latestTimestamp?: number;     // 毫秒级
  readableTime?: string;        // 本地格式字符串
  periodNumber?: number;        // 第几期（从2025-06-01开始）
  periodStartTime: number;      // 本期开始时间，毫秒
  updatePeriodStartTime: (startTime: number) => void;
  updatePeriodNumber: (number: number) => void;
  open?: number;
  close?: number;
  currentPrices?: CurrentPrices;  // 新增
  setKlineData: (data: KlineItem[]) => void;
  setCurrentPrices: (prices: CurrentPrices) => void;
  setPeriodNumber: (num: number) => void;
};

export const useKlineStore = create<KlineState>((set) => ({
  klineData: [],
  periodStartTime: Date.now(),
  currentPrices: undefined,

  updatePeriodStartTime: (startTime) => set({ periodStartTime: startTime }),
  updatePeriodNumber: (number) => set({ periodNumber: number }),
  setPeriodNumber: (num) => set({ periodNumber: num }),
  setCurrentPrices: (prices) => set({ currentPrices: prices }),

  setKlineData: (data) => {
    if (data.length === 0) {
      set({
        klineData: [],
        open: undefined,
        close: undefined,
        readableTime: undefined,
        periodNumber: undefined,
        currentPrices: undefined,
      });
      return;
    }

    const latest = data[data.length - 1];
    const msTimestamp = latest.timestamp * 1000;
    const date = new Date(msTimestamp);

    const baseTime = new Date('2025-06-06T00:00:00Z').getTime();
    const minutesSinceBase = Math.floor((msTimestamp - baseTime) / 60000);
    const periodNumber = minutesSinceBase + 1;

    set({
      klineData: data,
      latestTimestamp: msTimestamp,
      readableTime: date.toLocaleString(),
      open: latest.open,
      close: latest.close,
      periodNumber,
      periodStartTime: msTimestamp,
      currentPrices: {
        open: latest.open,
        close: latest.close,
        high: latest.high,
        low: latest.low,
      },
    });
  },
}));
