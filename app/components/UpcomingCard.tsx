// app/components/UpcomingCard.tsx
// app/components/UpcomingCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';

interface UpcomingCardProps {
  periodNumber: number;
  timeLeft: number; // 剩余秒数
  onBet: (type: 'up' | 'down', amount: number) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const UpcomingCard: React.FC<UpcomingCardProps> = ({ periodNumber, timeLeft, onBet }) => {
  const locked = false; // 默认不锁盘

  return (
    <CardWrapper variant="upcoming">
      <CardWrapper.Header
        period={periodNumber}
        countdown={formatTime(timeLeft)}
        progress={undefined}
      />

      <CardWrapper.Up onClick={() => onBet('up', 0)} disabled={locked} />

      <CardWrapper.Content open={null} close={null} pool={0} />

      <CardWrapper.Down onClick={() => onBet('down', 0)} disabled={locked} />
    </CardWrapper>
  );
};

export default UpcomingCard;
