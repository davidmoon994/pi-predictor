// app/components/PastCard.tsx
// app/components/PastCard.tsx
'use client';

import React from 'react';
import CardWrapper from './ui/CardWrapper';

interface PastCardProps {
  periodNumber: number;    // 可能你的类型是这个名
  open: number;
  close: number;
  poolAmount: number;
  readableTime: string;
  riseFallRatio: string;
}


const PastCard: React.FC<PastCardProps> = ({
  periodNumber,
  open,
  close,
  poolAmount,
  riseFallRatio,
}) => {
  return (
    <CardWrapper variant="past">
      <CardWrapper.Header
        period={periodNumber}
        countdown="已结束"
      />

      {/* ✅ 压缩高度 */}
      <CardWrapper.Up disabled className="h-6" />

      {/* ✅ 扩展中部展示内容 */}
      <CardWrapper.Content
        open={open.toString()}
        close={close.toString()}
        pool={poolAmount}
        ratio={riseFallRatio}
        isPastCard
      />

      {/* ✅ 压缩高度 */}
      <CardWrapper.Down disabled className="h-6" />
    </CardWrapper>
  );
};

export default PastCard;
