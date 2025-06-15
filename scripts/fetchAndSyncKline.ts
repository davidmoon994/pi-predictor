// scripts/fetchAndSyncKline.ts
// scripts/fetchAndSyncKline.ts

import 'dotenv/config';
import axios from 'axios';
import { getFirestore } from '../lib/firebase-admin';

const db = getFirestore();

// 获取 GateIO 最新未收盘的 5 分钟 K 线（数组最后一条是当前K线）
async function fetchLatestKline() {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=2`;
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'pi-predictor-sync-script/1.0'
  };

  try {
    const res = await axios.get(url, { headers });
    const data = res.data;
    const item = data[data.length - 1]; // 取最后一条，当前未收盘K线

    return {
      // 使用接口返回的K线时间戳作为主ID
      timestamp: Number(item[0]),

      volume: parseFloat(item[1]),
      close: parseFloat(item[2]),
      high: parseFloat(item[3]),
      low: parseFloat(item[4]),
      open: parseFloat(item[5]),

      // 额外标记本次同步时间，方便区分快照更新时间
      lastUpdated: Date.now(),
    };
  } catch (err: any) {
    console.error('请求错误:', err.response?.data || err.message);
    throw err;
  }
}

// 主同步逻辑：每分钟写入当前5分钟K线的实时快照，限制最多 200 条
async function syncKlineSnapshot() {
  const klineRef = db.collection('kline_data');
  const snapshot = await klineRef.orderBy('timestamp', 'asc').get();

  const existingCount = snapshot.size;
  const latestKline = await fetchLatestKline();

  const batch = db.batch();
  const docRef = klineRef.doc(latestKline.timestamp.toString());
  batch.set(docRef, latestKline, { merge: true });

  // 超出 200 条时，删除最旧数据
  if (existingCount >= 200) {
    const toDelete = snapshot.docs.slice(0, existingCount + 1 - 200);
    toDelete.forEach(doc => batch.delete(doc.ref));
  }

  await batch.commit();
  console.log(`✅ 写入快照 @ ${new Date(latestKline.timestamp).toISOString()}`);
}

syncKlineSnapshot().catch((err) => {
  console.error('❌ 快照同步失败:', err.message);
  process.exit(1);
});
