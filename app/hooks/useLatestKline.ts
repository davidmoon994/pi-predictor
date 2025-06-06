//自动每分钟拉取一次一条最新K线数据渲染，实时数据，用收盘价开奖。
// hooks/useLatestKline.ts
import { useEffect } from 'react';
import { useKlineStore } from '../../lib/store/klineStore';

export function useLatestKline() {
  const setKlineData = useKlineStore((state) => state.setKlineData);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/kline");
        const json = await res.json();
        if (json?.data) {
          setKlineData(json.data); // ✅ 写入 Zustand
        }
      } catch (error) {
        console.error("🔥 拉取 K 线失败", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // 每分钟刷新

    return () => clearInterval(interval);
  }, [setKlineData]);
}

