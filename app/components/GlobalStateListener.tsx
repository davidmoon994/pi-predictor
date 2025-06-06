// app/components/GlobalStateListener.tsx
"use client";

import { useEffect } from "react";
import { useUserStore } from "../../lib/store/useStore";
import { useKlineStore } from "../../lib/store/klineStore";
import { usePeriodStore } from "../../lib/store/usePeriodStore";

export default function GlobalStateListener() {
  const user = useUserStore((state) => state.user);
  const kline = useKlineStore((state) => state.klineData);
  const currentPeriodId = usePeriodStore((state) => state.history[0]?.periodNumber);
const period = currentPeriodId;  // 直接用 currentPeriodId 就是当前期号

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  useEffect(() => {
    if (kline?.length) {
      sessionStorage.setItem("klineData", JSON.stringify(kline));
    }
  }, [kline]);

  useEffect(() => {
    if (period) {
      localStorage.setItem("currentPeriodId", period.toString());
    }
  }, [period]);

  return null;
}
