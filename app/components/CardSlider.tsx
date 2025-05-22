//app/components/CardSlider.tsx
"use client";
import { useRef, useState, useEffect } from "react";
import PastCard from "./PastCard";
import CurrentCard from "./CurrentCard";
import NextCard from "./NextCard";
import UpcomingCard from "./UpcomingCard";
import { drawAndSettle } from '@lib/drawService';

// ✅ 定义接收的 Props 类型
type User = {
  uid: string;
  displayName: string;
  email?: string;
};

type CardSliderProps = {
  user: User | null;
  onPeriodEnd: () => void;
};

// ✅ 接收 props
const CardSlider = ({ user, onPeriodEnd }: CardSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [closePrice, setClosePrice] = useState<number | null>(null);
  const [periodId, setPeriodId] = useState("20250521");
  const [timeLeft, setTimeLeft] = useState(300);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  const cardWidth = 280;

  const goToNextPeriod = () => {
    const nextPeriod = (parseInt(periodId) + 1).toString();
    setPeriodId(nextPeriod);
    setTimeLeft(300);
  };

  const fetchKlineData = async () => {
    try {
      const response = await fetch('/api/kline');
      const data = await response.json();
      const klineData = data?.data?.[0];
      return {
        open: klineData?.open,
        close: klineData?.close,
      };
    } catch (error) {
      console.error("Failed to fetch K-line data:", error);
      return { open: null, close: null };
    }
  };

  useEffect(() => {
    const updateKlineData = async () => {
      const { open, close } = await fetchKlineData();
      setOpenPrice(open);
      setClosePrice(close);
    };

    updateKlineData();
    const interval = setInterval(updateKlineData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (openPrice !== null && closePrice !== null) {
        drawAndSettle(periodId, openPrice, closePrice).then(() => {
          goToNextPeriod();
          onPeriodEnd(); // ✅ 通知父组件开奖已完成
        });
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, openPrice, closePrice, periodId]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      requestAnimationFrame(() => {
        slider.scrollLeft = slider.scrollWidth - slider.clientWidth;
      });
    }
  }, []);

  const scrollLeft = () => {
    if (scrollIndex > 0) {
      const newIndex = scrollIndex - 1;
      sliderRef.current?.scrollTo({ left: newIndex * cardWidth, behavior: "smooth" });
      setScrollIndex(newIndex);
    }
  };

  const scrollRight = () => {
    if (scrollIndex < 5 - 1) {
      const newIndex = scrollIndex + 1;
      sliderRef.current?.scrollTo({ left: newIndex * cardWidth, behavior: "smooth" });
      setScrollIndex(newIndex);
    }
  };

  const pastPeriods = Array.from({ length: 10 }, (_, i) =>
    (parseInt(periodId) - 10 + i).toString()
  );

  return (
    <div className="relative w-full">
      <div
        ref={sliderRef}
        className="w-full overflow-x-scroll whitespace-nowrap flex items-start gap-4 px-4 pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        style={{ scrollBehavior: "smooth", scrollbarGutter: "stable" }}
      >
        {pastPeriods.map((period) => (
          <div key={period} className="inline-block w-[260px] shrink-0">
            <PastCard period={period} />
          </div>
        ))}

        <div className="inline-block w-[260px] shrink-0">
          <CurrentCard
            period={periodId}
            user={user}
            onPeriodEnd={onPeriodEnd}
          />
        </div>

        <div className="inline-block w-[260px] shrink-0">
          <NextCard period={(parseInt(periodId) + 1).toString()} />
        </div>

        <div className="inline-block w-[260px] shrink-0">
          <UpcomingCard period={(parseInt(periodId) + 2).toString()} />
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
