const fetch = require('node-fetch');
const admin = require('firebase-admin');

// 解析 JSON 字符串到对象
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// 初始化 Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  const url = 'https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=1';

  try {
    const res = await fetch(url);
    const data = await res.json();
    const [timestamp, open, high, low, close, volume] = data[0];

    const doc = {
      timestamp: Number(timestamp),
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
      volume: Number(volume),
      updatedAt: new Date().toISOString()
    };

    await db.collection('kline_data').doc(String(timestamp)).set(doc);
    console.log('✅ 数据已写入 Firestore:', doc);
  } catch (err) {
    console.error('❌ 错误:', err);
    process.exit(1);
  }
}

main();