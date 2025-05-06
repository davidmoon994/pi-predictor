// app/services/cardGenerator.ts

export const generateCards = (): CardData[] => {
  return [
    // 8 张往期卡片
    ...Array.from({ length: 8 }).map((_, i) => ({
      issueId: generateIssueId(-10 + i),
      type: 'past' as 'past',  // 强制类型断言为 'past'
      result: Math.random() > 0.5 ? 'up' : 'down',  // 'up' 或 'down'
      price: 3.1415 + Math.random() * 0.05,
      upOdds: 1.8,
      downOdds: 2.2,
      priceChange: (Math.random() - 0.5) * 0.01,
      lockedPrice: 3.14,
      prizePool: 80 + Math.random() * 40,
    })),
    // 左一
    {
      issueId: generateIssueId(-2),
      type: 'past' as 'past',  // 强制类型断言为 'past'
      result: Math.random() > 0.5 ? 'up' : 'down',
      price: 3.15,
      upOdds: 1.9,
      downOdds: 2.1,
      priceChange: 0.001,
      lockedPrice: 3.14,
      prizePool: 100,
    },
    // 左二
    {
      issueId: generateIssueId(-1),
      type: 'past' as 'past',  // 强制类型断言为 'past'
      result: Math.random() > 0.5 ? 'up' : 'down',
      price: 3.16,
      upOdds: 2.0,
      downOdds: 1.8,
      priceChange: -0.0015,
      lockedPrice: 3.14,
      prizePool: 110,
    },
    // 当前开奖卡片
    {
      issueId: generateIssueId(0),
      type: 'current' as 'current',  // 强制类型断言为 'current'
      result: 'up',
      price: 3.17,
      upOdds: 1.95,
      downOdds: 2.05,
      priceChange: 0,
      lockedPrice: 3.17,
      prizePool: 120,
    },
    // 当前可投卡片
    {
      issueId: generateIssueId(1),
      type: 'next' as 'next',  // 强制类型断言为 'next'
      result: undefined,
      price: 3.18,
      upOdds: 2.0,
      downOdds: 1.9,
      priceChange: 0,
      lockedPrice: 3.18,
      prizePool: 90,
    },
    // 即将开放投注卡片
    {
      issueId: generateIssueId(2),
      type: 'upcoming' as 'upcoming',  // 强制类型断言为 'upcoming'
      result: undefined,
      price: 3.19,
      upOdds: 1.85,
      downOdds: 2.15,
      priceChange: 0,
      lockedPrice: 3.19,
      prizePool: 70,
    },
  ];
};
