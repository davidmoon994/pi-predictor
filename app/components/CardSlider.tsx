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
import { drawAndSettle } from '../../lib/drawService';
import { UserData } from '@lib/types';
import { onSnapshot, getFirestore, collection, query, orderBy, limit } from 'firebase/firestore';
import { app } from '@lib/firebase'; // 确保正确导入 firebase client

interface CardSliderProps {
  user: UserData | null;
  onPeriodEnd: () => void;
}

const periodDuration = 5 * 60 * 1000; // 5分钟

const CardSlider: React.FC<CardSliderProps> = ({ user: passedUser, onPeriodEnd }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isSettlingRef = useRef(false);

  const { user } = useUserStore();
  const {
    periodNumber,
    periodStartTime,
    updatePeriodNumber,
    updatePeriodStartTime,
    currentPrices,
  } = useKlineStore();

  const [currentTimeLeft, setCurrentTimeLeft] = useState(300);
  const [nextTimeLeft, setNextTimeLeft] = useState(600);
  const [upcomingTimeLeft, setUpcomingTimeLeft] = useState(900);

  const recentPeriods = usePeriodStore(state => state.history);
  const setHistory = usePeriodStore(state => state.setHistory);

  // 滚动到最右端
  const scrollToLatestCard = () => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    }
  };

  // 监听 Firestore 最近 10 期数据（结算结果）
  useEffect(() => {
    const db = getFirestore(app);
    const q = query(collection(db, 'periods'), orderBy('periodNumber', 'desc'), limit(10));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data()).reverse(); // 从旧到新
      setHistory(data);
    });

    return () => unsub();
  }, [setHistory]);

  // 倒计时逻辑
  useEffect(() => {
    if (!periodStartTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - periodStartTime;
      const left = Math.floor((periodDuration - (elapsed % periodDuration)) / 1000);

      setCurrentTimeLeft(left);
      setNextTimeLeft(left + 300);
      setUpcomingTimeLeft(left + 600);
    }, 1000);

    return () => clearInterval(timer);
  }, [periodStartTime]);

  // 自动结算逻辑（带锁）
  useEffect(() => {
    if (
      currentTimeLeft === 1 &&
      periodNumber != null &&
      currentPrices?.open != null &&
      currentPrices?.close != null &&
      currentPrices?.high != null &&
      currentPrices?.low != null &&
      !isSettlingRef.current
    ) {
      isSettlingRef.current = true;

      const { open, close, high, low } = currentPrices;

      drawAndSettle(
        periodNumber,
        open,
        close,
        high,
        low,
        0,
        0,
        0,
        periodStartTime ?? Date.now()
      )
        .then(() => {
          updatePeriodNumber(periodNumber + 1);
          updatePeriodStartTime(Date.now());
          onPeriodEnd?.();

          requestAnimationFrame(() => scrollToLatestCard());
        })
        .finally(() => {
          setTimeout(() => {
            isSettlingRef.current = false;
          }, 2000); // 延迟解锁，避免重复触发
        });
    }
  }, [
    currentTimeLeft,
    periodNumber,
    currentPrices,
    updatePeriodNumber,
    updatePeriodStartTime,
    periodStartTime,
    onPeriodEnd,
  ]);

  // 初始滚动
  useEffect(() => {
    scrollToLatestCard();
  }, []);

  if (periodNumber == null) return <div>加载中...</div>;

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-4 p-4 no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* 最多展示最近 10 期历史卡片 */}
        {recentPeriods.slice(-10).map((period) => (
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
