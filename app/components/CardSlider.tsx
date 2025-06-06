// app/components/CardSlider.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import CurrentCard from './CurrentCard';
import PastCard from './PastCard';
import NextCard from './NextCard';
import UpcomingCard from './UpcomingCard';
import CardWrapper from './ui/CardWrapper';
import { useUserStore } from '../../lib/store/useStore';
import { useKlineStore } from '../../lib/store/klineStore';
import { drawAndSettle, getRecentPeriods } from '../../lib/drawService'; // ✅ 新增 getRecentPeriods
import { usePeriodStore } from '../../lib/store/usePeriodStore';
import { UserData } from "@lib/types"

interface CardSliderProps {
  user: UserData | null;
  onPeriodEnd: () => void;
}


const periodDuration = 5 * 60; // 每期 5 分钟（秒）

const CardSlider: React.FC<CardSliderProps> = ({ user: passedUser, onPeriodEnd }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();
  const {
    periodNumber,
    periodStartTime,
    updatePeriodNumber,
    updatePeriodStartTime,
    currentPrices,
  } = useKlineStore();

  const handleBet = (type: 'up' | 'down', amount: number) => {
    console.log('用户下注：', type, amount);
  };
  

  const [currentTimeLeft, setCurrentTimeLeft] = useState(300); // 当前卡 5分钟倒计时
  const [nextTimeLeft, setNextTimeLeft] = useState(600);       // 下期卡 10分钟
  const [upcomingTimeLeft, setUpcomingTimeLeft] = useState(900); // 即将到来卡 15分钟

  // 每秒重新计算倒计时
  useEffect(() => {
    if (!periodStartTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSec = Math.floor((now - periodStartTime) / 1000);
      const left = periodDuration - (elapsedSec % periodDuration);

      setCurrentTimeLeft(left);
      setNextTimeLeft(left + periodDuration);
      setUpcomingTimeLeft(left + 2 * periodDuration);
    }, 1000);

    return () => clearInterval(interval);
  }, [periodStartTime]);

  // 结算逻辑，当倒计时接近结束时触发
  useEffect(() => {
    if (currentTimeLeft === 1 && periodNumber != null && currentPrices) {
      const { open, close, high, low } = currentPrices;

      if (open != null && close != null && high != null && low != null) {
        drawAndSettle(
          periodNumber,
          open,
          close,
          high,
          low,
          0, // poolAmount 目前传 0 可改成真实值
          0, // upAmount
          0, // downAmount
          periodStartTime ?? Date.now()
        ).then(() => {
          updatePeriodNumber(periodNumber + 1);
          updatePeriodStartTime(Date.now());

          const container = scrollRef.current;
          if (container) {
            container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
          }
        });
      } else {
        // 价格不完整，依旧推进期数
        updatePeriodNumber(periodNumber + 1);
        updatePeriodStartTime(Date.now());
      }
    }
  }, [currentTimeLeft, periodNumber, currentPrices, updatePeriodNumber, updatePeriodStartTime, periodStartTime]);

  // 初次加载滑动到最右
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  }, []);

  // 加载最近10期结算缓存
  const recentPeriods = getRecentPeriods();

  if (periodNumber == null) return <div>加载中...</div>;

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 p-4 no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* 最近10期往期PastCard */}
        {recentPeriods.map((period) => (
          <div key={`past-${period.periodNumber}`} className="flex-shrink-0 w-[240px]">
            <CardWrapper>
              <PastCard
                period={period.periodNumber}
                open={period.open}
                close={period.close}
                pool={period.poolAmount}
                readableTime={period.readableTime}
        riseFallRatio={period.riseFallRatio}
              />
            </CardWrapper>
          </div>
        ))}

        {/* 当前期卡片 */}
        <div className="flex-shrink-0 w-[240px]">
          <CardWrapper>
            <CurrentCard timeLeft={currentTimeLeft} onBet={handleBet} />

          </CardWrapper>
        </div>

        {/* 下一期卡片 */}
        <div className="flex-shrink-0 w-[240px]">
          <CardWrapper>
          <NextCard timeLeft={nextTimeLeft} onBet={handleBet} />
          </CardWrapper>
        </div>

        {/* 即将到来卡片 */}
        <div className="flex-shrink-0 w-[240px]">
          <CardWrapper>
          <UpcomingCard timeLeft={upcomingTimeLeft} onBet={handleBet} />
          </CardWrapper>
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
