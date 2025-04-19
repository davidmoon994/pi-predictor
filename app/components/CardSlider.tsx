'use client';
import React, { useState } from 'react';
import PastCard from './PastCard';
import CurrentCard from './CurrentCard';
import NextCard from './NextCard';
import UpcomingCard from './UpcomingCard';

interface CardData {
  id: string;
  type: 'past' | 'live' | 'next' | 'upcoming';
  lockedPrice: number;
  lastPrice: number;
  priceChange: number;
  prizePool: number;
  upPayout: number;
  downPayout: number;
}

const initialCards: CardData[] = [
  // 8 往期（7张被隐藏、通过箭头可轮动）：
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `#${1000 - i}`,
    type: 'past',
    lockedPrice: 3.14,
    lastPrice: 3.11,
    priceChange: -0.96,
    prizePool: 1200,
    upPayout: 1.5,
    downPayout: 2.1,
  })),
  // 当前开奖：
  {
    id: '#1001',
    type: 'live',
    lockedPrice: 3.15,
    lastPrice: 3.17,
    priceChange: 0.63,
    prizePool: 1400,
    upPayout: 1.8,
    downPayout: 1.9,
  },
  // 下一期可投注：
  {
    id: '#1002',
    type: 'next',
    lockedPrice: 3.17,
    lastPrice: 3.17,
    priceChange: 0,
    prizePool: 0,
    upPayout: 2.0,
    downPayout: 2.0,
  },
  // 即将开始投注：
  {
    id: '#1003',
    type: 'upcoming',
    lockedPrice: 3.17,
    lastPrice: 3.17,
    priceChange: 0,
    prizePool: 0,
    upPayout: 0,
    downPayout: 0,
  },
];

export default function CardSlider() {
  const [startIndex, setStartIndex] = useState(0);

  // 最多展示 5 张（左2 + 当前 + 右1 + 右2）
  const visibleCards = initialCards.slice(startIndex, startIndex + 5);

  const handleLeft = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  const handleRight = () => {
    if (startIndex < 8) setStartIndex(startIndex + 1); // 最多滑动到第8个
  };

  const renderCard = (card: CardData) => {
    const commonProps = {
      issueId: card.id,
      lockedPrice: card.lockedPrice,
      lastPrice: card.lastPrice,
      priceChange: card.priceChange,
      prizePool: card.prizePool,
      upPayout: card.upPayout,
      downPayout: card.downPayout,
    };

    switch (card.type) {
      case 'past':
        return <PastCard key={card.id} {...commonProps} />;
      case 'live':
        return <CurrentCard key={card.id} {...commonProps} />;
      case 'next':
        return <NextCard key={card.id} {...commonProps} />;
      case 'upcoming':
        return <UpcomingCard key={card.id} {...commonProps} />;
    }
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="flex justify-center gap-4 px-4 transition-all duration-300">
        {visibleCards.map(renderCard)}
      </div>

      {/* 左右箭头 */}
      <div className="flex justify-center mt-4 gap-4">
        <button onClick={handleLeft} className="rounded-full px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white">
          ←
        </button>
        <button onClick={handleRight} className="rounded-full px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white">
          →
        </button>
        <span className="text-sm text-gray-400 ml-4">显示第 {startIndex + 1} ~ {startIndex + visibleCards.length} 张</span>
      </div>
    </div>
  );
}
