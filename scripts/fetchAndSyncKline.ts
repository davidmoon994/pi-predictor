// scripts/fetchAndSyncKline.ts
import 'dotenv/config';
import axios from 'axios';
import { getFirestore } from '../lib/firebase-admin';
import { getPeriodNumber, formatReadableTime } from '../lib/utils/period';

const db = getFirestore();
const klineRef = db.collection('kline_data');

interface KlineData {
  timestamp: number;
  periodNumber: number;
  readableTime: string;
  volume: number;
  close: number;
  high: number;
  low: number;
  open: number;
  lastUpdated: number;
}

// 获取当前周期起始时间（向下对齐 5 分钟）
function getCurrentPeriodTimestamp(): number {
  const now = Math.floor(Date.now() / 1000);
  return now - (now % 300); // 每 300 秒 = 5 分钟
}

// 拉取最近几根 K 线（最多 10 根，防止漏数据）
async function fetchRecentKlines(): Promise<Record<number, KlineData>> {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=10`;

  const res = await axios.get(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pi-predictor-sync-script/1.0',
    },
  });

  const parsed: Record<number, KlineData> = {};
  for (const item of res.data) {
    const ts = Number(item[0]);
    parsed[ts] = {
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
  return parsed;
}

// 主逻辑
async function syncKline() {
  const snapshot = await klineRef.orderBy('timestamp', 'asc').get();
  const existingCount = snapshot.size;

  const currentTs = getCurrentPeriodTimestamp();
  const recent = await fetchRecentKlines();
  const batch = db.batch();

  if (existingCount === 0) {
    console.log('📦 初始化 Firestore，写入历史数据');
    Object.values(recent)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((item) => {
        const docRef = klineRef.doc(item.timestamp.toString());
        batch.set(docRef, item);
      });
    await batch.commit();
    return;
  }

  const current = recent[currentTs];

  let doc: KlineData;

  if (current) {
    doc = {
      ...current,
      lastUpdated: Date.now(),
    };
  } else {
    // 当前周期没有数据，手动构造
    const previousDoc = await klineRef
      .doc((currentTs - 300).toString())
      .get();

    let fallbackPrice = 0;

    if (previousDoc.exists) {
      fallbackPrice = previousDoc.data()?.close || 0;
    }

    doc = {
      timestamp: currentTs,
      periodNumber: getPeriodNumber(currentTs),
      readableTime: formatReadableTime(currentTs),
      volume: 0,
      open: fallbackPrice,
      close: fallbackPrice,
      high: fallbackPrice,
      low: fallbackPrice,
      lastUpdated: Date.now(),
    };

    console.log(`⚠️ 构造缺失周期 ${doc.periodNumber}，价格继承为 ${fallbackPrice}`);
  }

  const docRef = klineRef.doc(doc.timestamp.toString());
  const exists = await docRef.get();

  if (!exists.exists) {
    await docRef.set(doc);
    console.log(`✅ 写入 K 线 @ ${doc.readableTime}`);
  } else {
    await docRef.set(doc, { merge: true });
    console.log(`🔄 更新快照 @ ${doc.readableTime}`);
  }

  // 清理旧数据，保留最多 200 条
  const updatedSnapshot = await klineRef.orderBy('timestamp', 'asc').get();
  const excess = updatedSnapshot.size - 200;
  if (excess > 0) {
    const cleanupBatch = db.batch();
    updatedSnapshot.docs.slice(0, excess).forEach((doc) => {
      cleanupBatch.delete(doc.ref);
    });
    await cleanupBatch.commit();
    console.log(`🧹 删除最旧 ${excess} 条`);
  }
}

syncKline().catch((err) => {
  console.error('❌ 同步失败:', err.message);
  process.exit(1);
});

