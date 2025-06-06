// app/components/PastCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';

interface PastCardProps {
  period: number;
  open: number;
  close: number;
  pool: number;
  readableTime: string;
  riseFallRatio: string;
}

const PastCard: React.FC<PastCardProps> = ({
  period,
  open,
  close,
  pool,
  readableTime,
  riseFallRatio,
}) => {
  return (
    <CardWrapper variant="past">
      <CardWrapper.Header
        period={period}
        countdown="已结束"
        time={readableTime}
      />
      <CardWrapper.Content
  open={open + ''}     // 或 String(open)
  close={close + ''}   // 或 String(close)
  pool={pool}
/>

    </CardWrapper>
  );
};

export default PastCard;
