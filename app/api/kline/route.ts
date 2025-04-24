// app/api/Kline/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const url = 'https://api.gate.io/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=1';

  try {
    const res = await fetch(url, {
      // 可以加 headers 或其他代理设置
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // 禁止缓存，始终拿最新数据
    });

    if (!res.ok) {
      throw new Error(`Gate.io API error: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching K-line data:', error);
    return NextResponse.json({ error: 'Failed to fetch K-line data' }, { status: 500 });
  }
}
