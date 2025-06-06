// app/components/NextCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';
import { useKlineStore } from '../../lib/store/klineStore';

interface NextCardProps {
  timeLeft?: number; // 可选，因“下一期”未必有倒计时
  onBet?: (type: 'up' | 'down', amount: number) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const NextCard: React.FC<NextCardProps> = ({ timeLeft = 600, onBet }) => {
 
  const { periodNumber, open } = useKlineStore();

if (periodNumber === undefined) {
  return <div>加载中...</div>;
}

const nextPeriod = periodNumber + 1;

  return (
    <CardWrapper variant="next">
      <CardWrapper.Header
        period={nextPeriod}
        countdown={formatTime(timeLeft)}
      />

      <CardWrapper.Up onClick={() => onBet?.('up', 100)} />

      <CardWrapper.Content
        open="待开盘"
        close={ '--'}
        pool={0}
      />

      <CardWrapper.Down onClick={() => onBet?.('down', 100)} />
    </CardWrapper>
  );
};

export default NextCard;
