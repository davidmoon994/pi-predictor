// app/lib/klineApi.ts
export interface KlineData {
  timestamp: number;
  volume: string;
  close: string;
  high: string;
  low: string;
  open: string;
}

// 获取最�?1 条（用于开奖）
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
      console.error("获取 K 线失�?, err);
      return [];
    }
  }


// 获取最新价格（收盘价）
export async function fetchLatestPiPrice() {
    const res = await fetch('/api/kline/route');
    const data = await res.json();
    return parseFloat(data?.data?.[0]?.[2]); // 从数组中提取收盘�?
  }

  export const fetchKlineData = async () => {
    try {
      const res = await fetch('/api/kline/route');
      const json = await res.json();
      const data = json.data;
  
      if (!data || data.length === 0) {
        throw new Error('No K-line data available');
      }
  
      const lastItem = data[data.length - 1];
      const open = parseFloat(lastItem[2]);   // 开盘价
      const close = parseFloat(lastItem[5]);  // 收盘�?
  
      return { open, close };
    } catch (error) {
      console.error('Error fetching K-line data:', error);
      throw error;
    }
  };
