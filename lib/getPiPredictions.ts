// lib/getPiPredictions.ts
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function getPiPredictions() {
  try {
    const q = query(
      collection(db, 'kline'),
      orderBy('timestamp', 'desc'),
      limit(20) // 取最近 20 条，用于图表展示
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.error('没有找到 K 线数据');
      return [];
    }

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        timestamp: data.timestamp,
        open: data.open,
        close: data.close,
        high: data.high,
        low: data.low,
        volume: data.volume,
      };
    });
  } catch (error) {
    console.error('获取 Pi 预测数据失败', error);
    return [];
  }
}
