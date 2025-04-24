import { useRef, useState, useEffect } from "react";
import PastCard from "./PastCard";
import CurrentCard from "./CurrentCard";
import NextCard from "./NextCard";
import UpcomingCard from "./UpcomingCard";
import { fetchKlineData } from '@/lib/klineApi';
import { fetchLatestPiPrice } from '@/lib/klineApi';
import { drawAndSettle } from '@lib/drawService';

const CardSlider = () => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [openPrice, setOpenPrice] = useState<number | null>(null);
  const [closePrice, setClosePrice] = useState<number | null>(null);
  const [periodId, setPeriodId] = useState("20250421");
  const [timeLeft, setTimeLeft] = useState(300); // 默认300秒倒计时
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  const cardWidth = 280; // 每张卡片宽度 + 间距
  const maxIndex = 5; // 最多显示 5 张

  // 每分钟自动拉取最新价格
useEffect(() => {
  const updatePrice = async () => {
    const price = await fetchLatestPiPrice();
    setLatestPrice(price);
  };

  updatePrice(); // 页面首次加载
  const interval = setInterval(updatePrice, 60000); // 每分钟更新一次
  return () => clearInterval(interval);
}, []);
  
// 左右箭头点击滚动
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

  // 获取 K 线数据并设置开盘和收盘价
  const updateKlineData = async () => {
    try {
      const { open, close } = await fetchKlineData();
      setOpenPrice(open);
      setClosePrice(close);
    } catch (error) {
      console.error('Failed to update K-line data:', error);
    }
  };

  // 定时获取 K 线数据和更新时间
  useEffect(() => {
    const interval = setInterval(() => {
      updateKlineData(); // 每分钟更新一次 K 线数据
    }, 60000); // 60秒

    updateKlineData(); // 初始化时获取数据

    return () => clearInterval(interval); // 清理定时器
  }, []);

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getLatestPiPrice();
      if (price) setLatestPrice(price);
    };
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);
  
  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft <= 0) {
      if (openPrice !== null && closePrice !== null) {
        // 调用开奖处理逻辑（假设drawAndSettle已在上下文中）
        drawAndSettle(periodId, openPrice, closePrice);
      }
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, openPrice, closePrice]);

  return (
    <div className="relative w-full">
      {/* 顶部箭头导航 */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-8 z-20">
        <button
          onClick={scrollLeft}
          className="w-10 h-10 rounded-full border-2 border-white text-white font-bold text-xl shadow-md hover:scale-105 transition transform duration-300 bg-black/40"
        >
          ‹
        </button>
        <button
          onClick={scrollRight}
          className="w-10 h-10 rounded-full border-2 border-white text-white font-bold text-xl shadow-md hover:scale-105 transition transform duration-300 bg-black/40"
        >
          ›
        </button>
      </div>

      {/* 卡片滑动区域 */}
      <div
        ref={sliderRef}
        className="w-full overflow-x-auto whitespace-nowrap flex items-start gap-4 px-4 pb-2 scroll-smooth"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* Past Cards (最多2张) */}
        {["20250419", "20250420"].map((period) => (
          <div key={period} className="inline-block w-[260px] shrink-0">
            <PastCard period={period} />
          </div>
        ))}

        {/* Current Card */}
        <div className="inline-block w-[260px] shrink-0">
          <CurrentCard period={periodId} />
        </div>

        {/* Next Card */}
        <div className="inline-block w-[260px] shrink-0">
          <NextCard period={(+periodId + 1).toString()} />
        </div>

        {/* Upcoming Card */}
        <div className="inline-block w-[260px] shrink-0">
          <UpcomingCard period={(+periodId + 2).toString()} />
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
