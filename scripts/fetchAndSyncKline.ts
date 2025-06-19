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

// 🟢 拉取历史 200 条（首次启动时使用）
async function fetchInitialKlines(): Promise<KlineData[]> {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=200`;
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'pi-predictor-sync-script/1.0',
  };

  const res = await axios.get(url, { headers });
  const raw = res.data;

  return raw.reverse().map((item: string[]): KlineData => {
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

// 🟡 每分钟拉取最新 5 分钟快照（未收盘也抓）
async function fetchLatestKline(): Promise<KlineData> {
  const url = `https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=2`;
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'pi-predictor-sync-script/1.0',
  };

  const res = await axios.get(url, { headers });
  const item = res.data[res.data.length - 1]; // 最新周期快照（可能未收盘）

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

// 🚀 主同步逻辑
async function syncKline() {
  const snapshot = await klineRef.orderBy('timestamp', 'asc').get();
  const existingCount = snapshot.size;

  if (existingCount === 0) {
    console.log('📦 首次运行，写入历史 200 条 K 线...');
    const historicalData = await fetchInitialKlines();
    const batch = db.batch();
    historicalData.forEach((item: KlineData) => {
      const docRef = klineRef.doc(item.timestamp.toString());
      batch.set(docRef, item);
    });
    await batch.commit();
    console.log('✅ 历史数据已写入完毕');
    return;
  }

  // 🕒 获取当前快照
  const latest = await fetchLatestKline();
  const docRef = klineRef.doc(latest.timestamp.toString());

  const existingDoc = await docRef.get();

  if (!existingDoc.exists) {
    // ✅ 当前周期尚未写入，强制写入（无论是否有成交）
    await docRef.set(latest);
    console.log(`✅ 写入新快照 @ ${latest.readableTime}`);
  } else {
    // ✅ 已存在该时间段，更新为最新状态（open/close 变化等）
    await docRef.set(latest, { merge: true });
    console.log(`🔄 更新已有快照 @ ${latest.readableTime}`);
  }

  // 🧹 保留最新 200 条，删除多余
  const updatedSnapshot = await klineRef.orderBy('timestamp', 'asc').get();
  const excess = updatedSnapshot.size - 200;
  if (excess > 0) {
    console.log(`🗑 删除最旧 ${excess} 条...`);
    const batch = db.batch();
    updatedSnapshot.docs.slice(0, excess).forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log('✅ 旧数据清理完毕');
  }
}

syncKline().catch((err) => {
  console.error('❌ 同步失败:', err.message);
  process.exit(1);
});
