// lib/klineApi.ts

export interface KlineData {
    timestamp: number;
    volume: string;
    close: string;
    high: string;
    low: string;
    open: string;
  }
  
  export async function fetchLatestKline(): Promise<KlineData | null> {
    const url = 'https://api.gate.io/api/v4/spot/candlesticks';
    const params = new URLSearchParams({
      currency_pair: 'PI_USDT',
      interval: '5m',
      limit: '1',
    });
  
    try {
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const [timestamp, volume, close, high, low, open] = data[0];
        return {
          timestamp: Number(timestamp),
          volume,
          close,
          high,
          low,
          open,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch PI/USDT K-line:', error);
      return null;
    }
  }
  
  