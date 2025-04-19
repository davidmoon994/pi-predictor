// app/services/cardGenerator.ts

export interface CardData {
    issueId: string;
    type: 'past' | 'current' | 'next' | 'upcoming';
    result?: '涨' | '跌';
    price: number;
    upOdds: number;
    downOdds: number;
    priceChange: number;
    lockedPrice: number;
    prizePool: number;
  }
  
  // 生成期号
  export const generateIssueId = (offset: number): string => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalMinutes = Math.floor((now.getTime() - startOfDay.getTime()) / 60000);
    const currentRound = Math.floor(totalMinutes / 5);
    const round = currentRound + offset;
    return `${now.getFullYear().toString().slice(2)}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${round.toString().padStart(3, '0')}`;
  };
  
  // 获取期号结束时间
  export const getIssueEndTime = (offset: number): Date => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const totalMinutes = Math.floor((now.getTime() - startOfDay.getTime()) / 60000);
    const currentRound = Math.floor(totalMinutes / 5);
    const round = currentRound + offset + 1;
    return new Date(startOfDay.getTime() + round * 5 * 60000);
  };
  
  // 模拟生成 13 张卡片
  export const generateCards = (): CardData[] => {
    return [
      // 8 张往期卡片
      ...Array.from({ length: 8 }).map((_, i) => ({
        issueId: generateIssueId(-10 + i),
        type: 'past',
        result: Math.random() > 0.5 ? '涨' : '跌',
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
        type: 'past',
        result: Math.random() > 0.5 ? '涨' : '跌',
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
        type: 'past',
        result: Math.random() > 0.5 ? '涨' : '跌',
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
        type: 'current',
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
        type: 'next',
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
        type: 'upcoming',
        price: 3.19,
        upOdds: 1.85,
        downOdds: 2.15,
        priceChange: 0,
        lockedPrice: 3.19,
        prizePool: 70,
      },
    ];
  };