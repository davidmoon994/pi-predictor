// app/hooks/useLatestPiPrice.ts
'use client';

import { useEffect, useState } from "react";
import { getLatestPriceFromFirestore } from "../../lib/getKlineFromFirestore";

export const useLatestPiPrice = (token: string = "PI") => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const latestPrice = await getLatestPriceFromFirestore(token);
      setPrice(latestPrice);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, [token]); // 🔁 依赖 token，选择改变时重新请求

  return price;
};
