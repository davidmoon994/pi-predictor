'use client';

import { useEffect, useState } from 'react';

export default function useLatestPiPrice() {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        const res = await fetch('/api/kline');
        if (!res.ok) throw new Error('无法获取K线数据');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setPrice(parseFloat(data[0].close));
        } else if (data.close) {
          // 如果后端直接返回单个对象
          setPrice(parseFloat(data.close));
        } else {
          throw new Error('K线数据格式错误');
        }
      } catch (err) {
        console.error('获取 Pi 实时价格失败:', err);
      }
    }

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // 每分钟自动刷新

    return () => clearInterval(interval);
  }, []);

  return price;
}
