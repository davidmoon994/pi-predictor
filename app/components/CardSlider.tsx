import { useRef, useState, useEffect } from "react";
import PastCard from "./PastCard";
import CurrentCard from "./CurrentCard";
import NextCard from "./NextCard";
import UpcomingCard from "./UpcomingCard";
import { drawAndSettle } from '@lib/drawService';

const CardSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [closePrice, setClosePrice] = useState<number | null>(null);
  const [periodId, setPeriodId] = useState("20250421");
  const [timeLeft, setTimeLeft] = useState(300);
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  const cardWidth = 280;
  const maxIndex = 5;

  const fetchLatestPiPrice = async () => {
    try {
      const response = await fetch('/api/kline');
      const data = await response.json();
      return data?.data?.[0]?.close || null;
    } catch (error) {
      console.error("Failed to fetch Pi price:", error);
      return null;
    }
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
    const updatePrice = async () => {
      const price = await fetchLatestPiPrice();
      setLatestPrice(price);
    };

    updatePrice();
    const interval = setInterval(updatePrice, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateKlineData = async () => {
    const { open, close } = await fetchKlineData();
    setOpenPrice(open);
    setClosePrice(close);
  };

  useEffect(() => {
    updateKlineData();
    const interval = setInterval(updateKlineData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (openPrice !== null && closePrice !== null) {
        drawAndSettle(periodId, openPrice, closePrice);
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, openPrice, closePrice]);

  // 页面加载时自动滚动到最右侧
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

  return (
    <div className="relative w-full">
      
      {/* 卡片滑动区域 */}
      <div
        ref={sliderRef}
        className="w-full overflow-x-scroll whitespace-nowrap flex items-start gap-4 px-4 pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-800"
        style={{ scrollBehavior: "smooth", scrollbarGutter: "stable" }}
      >
        {["20250411","20250412","20250413","20250414","20250415","20250416","20250417","20250418","20250419", "20250420"].map((period) => (
          <div key={period} className="inline-block w-[260px] shrink-0">
            <PastCard period={period} />
          </div>
        ))}

        <div className="inline-block w-[260px] shrink-0">
          <CurrentCard period={periodId} />
        </div>

        <div className="inline-block w-[260px] shrink-0">
          <NextCard period={(+periodId + 1).toString()} />
        </div>

        <div className="inline-block w-[260px] shrink-0">
          <UpcomingCard period={(+periodId + 2).toString()} />
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
