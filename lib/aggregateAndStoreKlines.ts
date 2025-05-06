import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import axios from 'axios';

// ✅ 初始化 Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAiysHgtuiu5tv2-_e36ga-dSg7ieJuH4M",
  authDomain: "pi-predictor.firebaseapp.com",
  projectId: "pi-predictor",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ 获取原始每分钟 K 线数据（来源需根据你实际情况修改）
async function fetchRawKlines(): Promise<any[]> {
  const res = await axios.get(
    'https://api.gateio.ws/api/v4/spot/candlesticks',
    {
      params: {
        currency_pair: 'PI_USDT',
        interval: '1m',
        limit: 100,
      },
    }
  );

  return res.data.map((item: any[]) => ({
    timestamp: parseInt(item[0]) * 1000, // 秒转毫秒
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5]),
  }));
}

// ✅ 聚合为 5 分钟 K 线
function groupBy5Min(klines: any[]) {
  const grouped: Record<number, any[]> = {};

  for (const kline of klines) {
    const bucketTime = Math.floor(kline.timestamp / (5 * 60 * 1000)) * 5 * 60 * 1000;
    if (!grouped[bucketTime]) grouped[bucketTime] = [];
    grouped[bucketTime].push(kline);
  }

  const result = Object.entries(grouped).map(([timestampStr, items]) => {
    const timestamp = parseInt(timestampStr);
    const sorted = items.sort((a, b) => a.timestamp - b.timestamp);

    return {
      timestamp,
      open: sorted[0].open,
      close: sorted[sorted.length - 1].close,
      high: Math.max(...sorted.map((k) => k.high)),
      low: Math.min(...sorted.map((k) => k.low)),
      volume: sorted.reduce((sum, k) => sum + k.volume, 0),
    };
  });

  return result;
}

// ✅ 写入到 Firestore
async function writeKlinesToFirestore(klines: any[]) {
  const klineCollection = collection(db, 'kline');

  for (const k of klines) {
    const docRef = doc(klineCollection, k.timestamp.toString());
    await setDoc(docRef, k, { merge: true });
  }

  console.log(`✅ 写入成功，共写入 ${klines.length} 条记录`);
}

// ✅ 主函数（供调用）
export async function aggregateAndStore5MinKlines() {
  try {
    const raw = await fetchRawKlines();
    const grouped = groupBy5Min(raw);
    await writeKlinesToFirestore(grouped);
  } catch (err) {
    console.error('❌ 聚合或写入失败:', err);
  }
}
