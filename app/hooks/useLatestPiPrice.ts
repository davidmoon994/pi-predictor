// app/hooks/useLatestPiPrice.ts

'use client';
import { useEffect, useState } from "react";
import { getLatestPriceFromFirestore } from "@lib/getKlineFromFirestore";

export const useLatestPiPrice = () => {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      const latestPrice = await getLatestPriceFromFirestore();
      setPrice(latestPrice);
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);

  return price;
};