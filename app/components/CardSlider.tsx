// app/components/CardSlider.tsx
// app/components/CardSlider.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import CurrentCard from './CurrentCard';
import PastCard from './PastCard';
import NextCard from './NextCard';
import UpcomingCard from './UpcomingCard';
import { fetchRecentPeriodsFromFirestore, drawAndSettle } from '@lib/drawService';
import { usePeriodStore } from '@lib/store/usePeriodStore';
import { useUserStore } from '../../lib/store/useStore';
import { useKlineStore } from '../../lib/store/klineStore';
import { UserData } from '@lib/types';

interface CardSliderProps {
  user: UserData | null;
  onPeriodEnd: () => void;
}

const periodDuration = 5 * 60 * 1000; // 5分钟

const CardSlider: React.FC<CardSliderProps> = ({ user: passedUser, onPeriodEnd }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSettlingRef = useRef(false);

  const { user } = useUserStore();
  const latest = useKlineStore(state => state.latest);

  const periodNumber = latest?.periodNumber ?? 0;
  const readableTime = latest?.readableTime ?? '';
  const nextPeriodNumber = periodNumber + 1;
  const upcomingPeriodNumber = periodNumber + 2;

  const [currentTimeLeft, setCurrentTimeLeft] = useState(300);

  const recentPeriods = usePeriodStore(state => state.history);
  const setHistory = usePeriodStore(state => state.setHistory);

  // 滚动到最右端
  const scrollToLatestCard = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  };

  // 加载最近 10 期历史数据
  useEffect(() => {
    const fetchData = async () => {
      const recent = await fetchRecentPeriodsFromFirestore();
      setHistory(recent);
    };
    fetchData();
  }, [setHistory]);

  // ⏱ K线驱动倒计时
  useEffect(() => {
    if (!latest?.timestamp) return;

    const start = latest.timestamp;
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - start;
      const timeLeft = Math.floor((periodDuration - (elapsed % periodDuration)) / 1000);
      setCurrentTimeLeft(timeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [latest?.timestamp]);

  // ⏲ 自动结算逻辑（仅触发一次）
  useEffect(() => {
    if (
      currentTimeLeft === 1 &&
      latest &&
      !isSettlingRef.current
    ) {
      isSettlingRef.current = true;

      const { open, close, high, low, periodNumber, timestamp } = latest;

      drawAndSettle(
        periodNumber,
        open,
        close,
        high,
        low,
        0, 0, 0, timestamp
      ).then(() => {
        onPeriodEnd?.();
        scrollToLatestCard();
      }).finally(() => {
        setTimeout(() => {
          isSettlingRef.current = false;
        }, 2000);
      });
    }
  }, [currentTimeLeft, latest, onPeriodEnd]);

  return (
    <div className="relative w-full overflow-x-auto no-scrollbar">
      <div ref={scrollRef} className="flex space-x-4 p-4 min-w-max">
        {recentPeriods.slice(-10).map(period => (
          <div key={`past-${period.periodNumber}`} className="flex-shrink-0 w-[240px]">
            <PastCard
  periodNumber={period.periodNumber}
  open={period.open}
  close={period.close}
  poolAmount={period.poolAmount}
  readableTime={period.readableTime}
  riseFallRatio={period.riseFallRatio}
/>

          </div>
        ))}

        <div className="flex-shrink-0 w-[240px]">
          <CurrentCard timeLeft={currentTimeLeft} onBet={() => {}} />
        </div>

        <div className="flex-shrink-0 w-[240px]">
          <NextCard periodNumber={nextPeriodNumber} timeLeft={currentTimeLeft + 300} onBet={() => {}} />
        </div>

        <div className="flex-shrink-0 w-[240px]">
          <UpcomingCard periodNumber={upcomingPeriodNumber} timeLeft={currentTimeLeft + 600} onBet={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default CardSlider;
