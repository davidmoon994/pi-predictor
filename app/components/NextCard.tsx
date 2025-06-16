// app/components/NextCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';

interface NextCardProps {
  timeLeft?: number;
  onBet?: (type: 'up' | 'down', amount: number) => void;
  periodNumber: number; // ✅ 显式传入
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const NextCard: React.FC<NextCardProps> = ({ timeLeft = 600, onBet, periodNumber }) => {
  return (
    <CardWrapper variant="next">
      <CardWrapper.Header
        period={periodNumber}
        countdown={formatTime(timeLeft)}
      />

      <CardWrapper.Up onClick={() => onBet?.('up', 100)} />
      
      <CardWrapper.Content
        open="待开盘"
        close="--"
        pool={0}
      />

      <CardWrapper.Down onClick={() => onBet?.('down', 100)} />
    </CardWrapper>
  );
};

export default NextCard;
