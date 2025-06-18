//自动每分钟拉取一次一条最新K线数据渲染，实时数据，用收盘价开奖。
// hooks/useKlineData.ts

import { useEffect } from 'react';
import { useKlineStore } from '@lib/store/klineStore';
import { KlineItem } from '@lib/store/klineStore'; // ✅ 加入类型
import { getPeriodNumber, formatReadableTime } from '@lib/utils/period';

export function useKlineData() {
  const {
    setHistory,
    setLatest,
    setHasFetched,
    hasFetched,
  } = useKlineStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kline');
        const json = await res.json();

        if (!json || !Array.isArray(json.data)) {
          console.error('❌ 无效K线数据:', json);
          return;
        }

        const rawData = json.data;
        const latestData = json.latest;

        const formatted: KlineItem[] = rawData.map((item: any) => ({
          timestamp: item.timestamp,
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume),
          closed: true,
          periodNumber: item.periodNumber,
          readableTime: item.readableTime,
        }));

        if (!hasFetched) {
          setHistory(formatted);
          setHasFetched(true);
        }

        if (latestData?.timestamp) {
          const latest: KlineItem = {
            timestamp: latestData.timestamp,
            open: Number(latestData.open),
            high: Number(latestData.high),
            low: Number(latestData.low),
            close: Number(latestData.close),
            volume: Number(latestData.volume),
            closed: false,
            periodNumber: latestData.periodNumber,
            readableTime: latestData.readableTime,
          };
          setLatest(latest);
        }
      } catch (err) {
        console.error('❌ 获取K线数据失败:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [setHistory, setLatest, hasFetched, setHasFetched]);
}
