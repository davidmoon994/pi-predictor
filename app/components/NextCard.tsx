// app/components/NextCard.tsx
// app/components/NextCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';

interface NextCardProps {
  periodNumber: number;
  timeLeft: number; // 剩余秒数
  onBet: (type: 'up' | 'down', amount: number) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const NextCard: React.FC<NextCardProps> = ({ periodNumber, timeLeft, onBet }) => {
  const locked = timeLeft <= 60;

  return (
    <CardWrapper variant="next">
      <CardWrapper.Header
        period={periodNumber}
        countdown={formatTime(timeLeft)}
        progress={locked ? ((60 - timeLeft) / 60) * 100 : undefined}
      />

      <CardWrapper.Up onClick={() => onBet('up', 0)} disabled={locked} />

      <CardWrapper.Content open={null} close={null} pool={0} />

      <CardWrapper.Down onClick={() => onBet('down', 0)} disabled={locked} />
    </CardWrapper>
  );
};

export default NextCard;

