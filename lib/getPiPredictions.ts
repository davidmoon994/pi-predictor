// lib/getPiPredictions.ts
import { db } from './firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export async function getPiPredictions() {
  const doc = await db.collection('kline').doc('latest').get();
  if (!doc.exists) throw new Error('❌ 没有找到 K 线数据');

  const rawData = doc.data()?.data;
  if (!rawData || !Array.isArray(rawData)) throw new Error('❌ Firestore 中 K 线数据格式错误');

  // 这里确保所有字段都是数字，防止不一致
  const klineData = rawData.map((item: any) => ({
    timestamp: Number(item.timestamp),
    open: Number(item.open),
    high: Number(item.high),
    low: Number(item.low),
    close: Number(item.close),
    volume: Number(item.volume),
    quoteVolume: Number(item.quoteVolume),
    isClosed: item.isClosed === true || item.isClosed === 'true',
  }));

  return klineData;
}
