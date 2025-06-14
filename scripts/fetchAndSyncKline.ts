// scripts/fetchAndSyncKline.ts

import axios from 'axios';
import { getFirestore } from '../lib/firebase-admin';

const db = getFirestore();

// 获取最新 K 线数据
async function fetchLatestKline(count = 1) {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=${count}`;
  const res = await axios.get(url);
  return res.data.map((item: string[]) => ({
    timestamp: Number(item[0]),
    volume: parseFloat(item[1]),
    close: parseFloat(item[2]),
    high: parseFloat(item[3]),
    low: parseFloat(item[4]),
    open: parseFloat(item[5]),
  }));
}

// 同步函数
async function syncKline() {
  const klineRef = db.collection('kline_data');
  const snapshot = await klineRef.orderBy('timestamp', 'asc').get();

  const existingCount = snapshot.size;
  const firstRun = existingCount === 0;

  const newKlines = await fetchLatestKline(firstRun ? 200 : 1);

  const batch = db.batch();

  newKlines.forEach((kline: {
    timestamp: number;
    volume: number;
    close: number;
    high: number;
    low: number;
    open: number;
  }) => {
    const docRef = klineRef.doc(kline.timestamp.toString());
    batch.set(docRef, kline);
  });

  if (!firstRun && existingCount >= 200) {
    const docsToDelete = snapshot.docs.slice(0, existingCount + newKlines.length - 200);
    docsToDelete.forEach((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });
  }

  await batch.commit();
  console.log(`✅ 同步 ${newKlines.length} 条 K 线成功`);
}

syncKline().catch((err) => {
  console.error('❌ 同步失败:', err.message);
  process.exit(1);
});
