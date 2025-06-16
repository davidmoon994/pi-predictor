// app/components/UpcomingCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';

interface UpcomingCardProps {
  timeLeft?: number;
  onBet?: (type: 'up' | 'down', amount: number) => void;
  periodNumber: number; // ✅ 传入的期号
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const UpcomingCard: React.FC<UpcomingCardProps> = ({
  timeLeft = 900,
  onBet,
  periodNumber,
}) => {
  return (
    <CardWrapper variant="upcoming">
      <CardWrapper.Header
        period={periodNumber}
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
