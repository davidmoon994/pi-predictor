// app/lib/klineApi.ts
export interface KlineData {
  timestamp: number;
  volume: string;
  close: string;
  high: string;
  low: string;
  open: string;
}

// 获取最近 1 条（用于开奖）
export async function fetchLatestKlines(limit = 50) {
    try {
      const res = await fetch(`/api/kline`);
      const json = await res.json();
      if (json.data) {
        return json.data.map((item: any[]) => ({
          timestamp: item[0] * 1000,
          open: item[2],
          high: item[3],
          low: item[4],
          close: item[5],
        }));
      } else {
        return [];
      }
    } catch (err) {
      console.error("获取 K 线失败", err);
      return [];
    }
  }


// 获取最新价格（收盘价）
export async function getLatestPiPrice(): Promise<number | null> {
  const latest = await fetchLatestKline();
  return latest ? parseFloat(latest.close) : null;
}

