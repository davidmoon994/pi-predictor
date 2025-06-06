// app/components/CardSlider.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import CurrentCard from './CurrentCard';
import PastCard from './PastCard';
import NextCard from './NextCard';
import UpcomingCard from './UpcomingCard';
import CardWrapper from './ui/CardWrapper';
import { usePeriodStore } from '../../lib/store/usePeriodStore';
import { useUserStore } from '../../lib/store/useStore';
import { useKlineStore } from '../../lib/store/klineStore';
import { drawAndSettle, getRecentPeriods } from '../../lib/drawService';

import { UserData } from '@lib/types';

interface CardSliderProps {
  user: UserData | null;
  onPeriodEnd: () => void;
}

const periodDuration = 5 * 60 * 1000; // 5分钟，单位 ms

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

  const [currentTimeLeft, setCurrentTimeLeft] = useState(300); // 秒
  const [nextTimeLeft, setNextTimeLeft] = useState(600);
  const [upcomingTimeLeft, setUpcomingTimeLeft] = useState(900);

  const recentPeriods = usePeriodStore(state => state.history);


  // 倒计时更新逻辑
  useEffect(() => {
    if (!periodStartTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - periodStartTime;
      const left = Math.floor((periodDuration - (elapsed % periodDuration)) / 1000);

      setCurrentTimeLeft(left);
      setNextTimeLeft(left + 300); // +5分钟
      setUpcomingTimeLeft(left + 600); // +10分钟
    }, 1000);

    return () => clearInterval(timer);
  }, [periodStartTime]);

  // 每期结算逻辑：当前期结束，结算并进入下一期
  useEffect(() => {
    if (
      currentTimeLeft === 1 &&
      periodNumber != null &&
      currentPrices?.open != null &&
      currentPrices?.close != null &&
      currentPrices?.high != null &&
      currentPrices?.low != null
    ) {
      const { open, close, high, low } = currentPrices;

      drawAndSettle(
        periodNumber,
        open,
        close,
        high,
        low,
        0, // 可替换为真实 pool 数据
        0,
        0,
        periodStartTime ?? Date.now()
      ).then(() => {
        updatePeriodNumber(periodNumber + 1);
        updatePeriodStartTime(Date.now());
        onPeriodEnd?.();

        const container = scrollRef.current;
        if (container) {
          setTimeout(() => {
            container.scrollTo({
              left: container.scrollWidth,
              behavior: 'smooth',
            });
          }, 300); // 稍等再滑动
        }
      });
    }
  }, [currentTimeLeft, periodNumber, currentPrices, updatePeriodNumber, updatePeriodStartTime, periodStartTime]);

  // 初次加载滑动到最右
  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  }, []);

  if (periodNumber == null) return <div>加载中...</div>;

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 p-4 no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* 往期卡片 */}
        {recentPeriods.map((period) => (
          <div key={`past-${period.periodNumber}`} className="flex-shrink-0 w-[240px]">
            <PastCard
              period={period.periodNumber}
              open={period.open}
              close={period.close}
              pool={period.poolAmount}
              readableTime={period.readableTime}
              riseFallRatio={period.riseFallRatio}
            />
          </div>
        ))}

        {/* 当前期 */}
        <div className="flex-shrink-0 w-[240px]">
          <CardWrapper>
            <CurrentCard timeLeft={currentTimeLeft} onBet={() => {}} />
          </CardWrapper>
        </div>

        {/* 下一期 */}
        <div className="flex-shrink-0 w-[240px]">
          <CardWrapper>
            <NextCard timeLeft={nextTimeLeft} onBet={() => {}} />
          </CardWrapper>
        </div>

        {/* 即将到来 */}
        <div className="flex-shrink-0 w-[240px]">
          <CardWrapper>
            <UpcomingCard timeLeft={upcomingTimeLeft} onBet={() => {}} />
          </CardWrapper>
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
