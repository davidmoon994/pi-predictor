// app/hooks/useLatestPiPrice.ts
import { useEffect, useState } from "react";
import { fetchLatestKlines } from "@lib/klineApi";

export function useLatestPiPrice(intervalMs = 60000) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      const data = await fetchLatestKlines();
      if (data) {
        setPrice(parseFloat(data.close));
      }
    }

    fetchPrice(); // 初始化立即加载一�?
    const timer = setInterval(fetchPrice, intervalMs); // �?intervalMs 毫秒请求一�?

    return () => clearInterval(timer); // 清除定时�?
  }, [intervalMs]);

  return price;
}
