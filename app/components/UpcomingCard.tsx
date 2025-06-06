// app/components/UpcomingCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';
import { useKlineStore } from '../../lib/store/klineStore';

interface UpcomingCardProps {
  timeLeft?: number;
  onBet?: (type: 'up' | 'down', amount: number) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const UpcomingCard: React.FC<UpcomingCardProps> = ({ timeLeft = 900, onBet }) => {
  const { periodNumber } = useKlineStore();
  if (periodNumber === undefined) return null; // 或显示 loading 占位符
  const upcomingPeriod = periodNumber + 2;

  return (
    <CardWrapper variant="upcoming">
      <CardWrapper.Header
        period={upcomingPeriod}
        countdown={formatTime(timeLeft)}
      />

      <CardWrapper.Up onClick={() => onBet?.('up', 100)} />

      <CardWrapper.Content
        open="待开盘"
        close="—"
        pool={0}
      />

      <CardWrapper.Down onClick={() => onBet?.('down', 100)} />
    </CardWrapper>
  );
};

export default UpcomingCard;
