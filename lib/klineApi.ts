import { getKlineFromFirestore } from '../lib/getKlineFromFirestore'; // Firestore 数据获取

// K线数据接口
export interface KlineData {
  timestamp: number;
  volume: string;
  close: string;
  high: string;
  low: string;
  open: string;
}

// 获取最近 50 条 K 线数据（可用于显示）
export async function fetchLatestKlines(limit = 50) {
  try {
    // 从 Firestore 获取 K 线数据
    const firestoreData = await getKlineFromFirestore(limit);

    // 格式化数据
    return firestoreData.map((item: any) => ({
      timestamp: item.timestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));
  } catch (err) {
    console.error("获取 K 线失败:", err);
    return [];
  }
}

// 获取最新的 Pi 收盘价
export async function fetchLatestPiPrice() {
  try {
    const firestoreData = await getKlineFromFirestore(1);
    return parseFloat(firestoreData[0]?.close || "0"); // 提取最新的收盘价
  } catch (err) {
    console.error('获取 Pi 最新价格失败:', err);
    return 0;
  }
}

// 获取最新的 K 线数据（包括开盘和收盘价）
export const fetchKlineData = async () => {
  try {
    const firestoreData = await getKlineFromFirestore(1);
    if (!firestoreData || firestoreData.length === 0) {
      throw new Error('No K-line data available');
    }

    const lastItem = firestoreData[0]; // 获取最新的 K 线数据
    const open = parseFloat(lastItem.open);   // 开盘价
    const close = parseFloat(lastItem.close); // 收盘价

    return { open, close };
  } catch (error) {
    console.error('Error fetching K-line data:', error);
    throw error;
  }
};
