// scripts/fetchAndSyncKline.ts
import 'dotenv/config';
import axios from 'axios';
import { getFirestore } from '../lib/firebase-admin';
import { getPeriodNumber, formatReadableTime } from '../lib/utils/period';

const db = getFirestore();
const klineRef = db.collection('kline_data');

// 🟢 拉取历史 200 条 K 线（升序写入）
async function fetchInitialKlines() {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=200`;
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'pi-predictor-sync-script/1.0',
  };

  const res = await axios.get(url, { headers });
  const raw = res.data;

  return raw.reverse().map((item: string[]) => {
    const ts = Number(item[0]);
    return {
      timestamp: ts,
      periodNumber: getPeriodNumber(ts),
      readableTime: formatReadableTime(ts),
      volume: parseFloat(item[1]),
      close: parseFloat(item[2]),
      high: parseFloat(item[3]),
      low: parseFloat(item[4]),
      open: parseFloat(item[5]),
      lastUpdated: Date.now(),
    };
  });
}

// 🟡 拉取最新未收盘的快照
async function fetchLatestKline() {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=2`;
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'pi-predictor-sync-script/1.0',
  };

  const res = await axios.get(url, { headers });
  const item = res.data[res.data.length - 1];

  const ts = Number(item[0]);

  return {
    timestamp: ts,
    periodNumber: getPeriodNumber(ts),
    readableTime: formatReadableTime(ts),
    volume: parseFloat(item[1]),
    close: parseFloat(item[2]),
    high: parseFloat(item[3]),
    low: parseFloat(item[4]),
    open: parseFloat(item[5]),
    lastUpdated: Date.now(),
  };
}

// 🚀 主逻辑：首次写入 200 条，否则追加新快照
async function syncKline() {
  const snapshot = await klineRef.orderBy('timestamp', 'asc').get();
  const existingCount = snapshot.size;

  const batch = db.batch();

  if (existingCount === 0) {
    console.log('📦 首次运行，写入历史 200 条 K 线...');
    const historicalData = await fetchInitialKlines();
    historicalData.forEach((item) => {
      const docRef = klineRef.doc(item.timestamp.toString());
      batch.set(docRef, item);
    });
  } else {
    const latest = await fetchLatestKline();
    const docRef = klineRef.doc(latest.timestamp.toString());
    batch.set(docRef, latest, { merge: true });

    if (existingCount >= 200) {
      const toDelete = snapshot.docs.slice(0, existingCount + 1 - 200);
      toDelete.forEach((doc) => batch.delete(doc.ref));
    }

    console.log(`✅ 已追加快照 @ ${latest.readableTime}`);
  }

  await batch.commit();
}

syncKline().catch((err) => {
  console.error('❌ 同步失败:', err.message);
  process.exit(1);
});
