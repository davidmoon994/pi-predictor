//自动每分钟拉取一次一条最新K线数据渲染，实时数据，用收盘价开奖。
// hooks/useKlineData.ts
import { useEffect, useRef } from 'react';
import { useKlineStore } from '@lib/store/klineStore';
import { getPeriodNumber, formatReadableTime } from '@lib/utils/period';

export function useKlineData() {
  const { setHistory, setLatest } = useKlineStore();
  const hasFetched = useRef(false); // 防止重复初始化历史数据

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/kline');
        const json = await res.json();

        if (!Array.isArray(json)) {
          console.error("❌ 无效K线数据:", json);
          return;
        }

        const formatted = json.map((item: any) => {
          const [ts, open, high, low, close, volume, closed] = item;
          const timestamp = Number(ts);
          return {
            timestamp,
            open: Number(open),
            high: Number(high),
            low: Number(low),
            close: Number(close),
            volume: Number(volume),
            closed: closed === 'true',
            periodNumber: getPeriodNumber(timestamp),
            readableTime: formatReadableTime(timestamp),
          };
        });

        if (!hasFetched.current) {
          const history = formatted.filter((item) => item.closed);
          setHistory(history); // ✅ 第一次设置历史数据
          hasFetched.current = true;
        }

        // ✅ 设置最新未收盘数据（最后一条）
        const latest = formatted[formatted.length - 1];
        if (!latest.closed) {
          setLatest(latest);
        }

      } catch (err) {
        console.error("获取K线数据失败:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [setHistory, setLatest]);
}
