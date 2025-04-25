// app/hooks/useLatestPiPrice.ts
import { useEffect, useState } from "react";
import { fetchLatestKline } from "@lib/KlineApi";

export function useLatestPiPrice(intervalMs = 60000) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      const data = await fetchLatestKline();
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
