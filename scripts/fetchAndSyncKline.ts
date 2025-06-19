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

// 对齐到 5 分钟
function getAlignedTimestamp(offsetMinutes = 0): number {
  const now = Math.floor(Date.now() / 1000);
  return now - (now % 300) - offsetMinutes * 60;
}

// 获取最近 10 条 K 线（用作参考）
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

async function syncKline() {
  const recentData = await fetchRecentKlines();

  // 🔁 补齐当前 + 前两个周期（3 根）
  const periodsToCheck = [0, 5, 10].map((offset) => getAlignedTimestamp(offset));

  const batch = db.batch();

  for (const ts of periodsToCheck.reverse()) {
    const exists = await klineRef.doc(ts.toString()).get();

    if (exists.exists) {
      // 🔄 更新 lastUpdated（可选）
      batch.set(klineRef.doc(ts.toString()), { lastUpdated: Date.now() }, { merge: true });
      continue;
    }

    let doc: KlineData;
    const match = recentData[ts];

    if (match) {
      doc = {
        ...match,
        lastUpdated: Date.now(),
      };
    } else {
      // ❗️没抓到这一根 → 继承前一根 close 来构造
      const prev = await klineRef.doc((ts - 300).toString()).get();
      const price = prev.exists ? prev.data()?.close || 0 : 0;

      doc = {
        timestamp: ts,
        periodNumber: getPeriodNumber(ts),
        readableTime: formatReadableTime(ts),
        volume: 0,
        open: price,
        close: price,
        high: price,
        low: price,
        lastUpdated: Date.now(),
      };

      console.log(`⚠️ 构造缺失周期 ${doc.periodNumber}，继承价格为 ${price}`);
    }

    batch.set(klineRef.doc(ts.toString()), doc);
    console.log(`✅ 写入周期 ${doc.periodNumber} @ ${doc.readableTime}`);
  }

  await batch.commit();

  // 🧹 最多保留 200 条
  const all = await klineRef.orderBy('timestamp', 'asc').get();
  const excess = all.size - 200;
  if (excess > 0) {
    const cleanup = db.batch();
    all.docs.slice(0, excess).forEach((doc) => cleanup.delete(doc.ref));
    await cleanup.commit();
    console.log(`🧹 删除最旧 ${excess} 条`);
  }
}

syncKline().catch((err) => {
  console.error('❌ 同步失败:', err.message);
  process.exit(1);
});
