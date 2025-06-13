//lib/fetchAndCacheKline.ts

import https from 'https';
import { getFirestore } from '@lib/firebase-admin';

const db = getFirestore();
const COLLECTION = 'kline_data'; // 我们将数据写入这个集合，每条 K 线一个文档

export async function fetchAndAppendLatestKline(): Promise<any | null> {
  const url = 'https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=1';

  return new Promise((resolve, reject) => {
    https.get(url, async (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            return resolve(null);
          }

          const item = parsed[0];
          const klineData = {
            timestamp: Number(item[0]), // 秒
            volume: parseFloat(item[1]),
            close: parseFloat(item[2]),
            high: parseFloat(item[3]),
            low: parseFloat(item[4]),
            open: parseFloat(item[5]),
            quoteVolume: parseFloat(item[6]),
            isClosed: true,
          };

          const docId = String(klineData.timestamp);
          const existingDoc = await db.collection(COLLECTION).doc(docId).get();

          if (existingDoc.exists) {
            console.log('⚠️ 已存在，无需写入:', docId);
            return resolve(null);
          }

          await db.collection(COLLECTION).doc(docId).set(klineData);
          console.log('✅ 新 K 线写入:', docId);

          // 保持最多 200 条：按 timestamp 倒序，删除多余的
          const allDocs = await db.collection(COLLECTION)
            .orderBy('timestamp', 'desc')
            .offset(200)
            .get();

          const batch = db.batch();
          allDocs.docs.forEach((doc) => batch.delete(doc.ref));
          if (!allDocs.empty) {
            await batch.commit();
            console.log(`🧹 已清理 ${allDocs.size} 条旧数据`);
          }

          resolve(klineData);
        } catch (err) {
          console.error('🔥 JSON 解析失败:', err);
          reject(new Error('解析响应失败'));
        }
      });
    }).on('error', (err) => {
      console.error('🔥 HTTPS 请求错误:', err);
      reject(err);
    });
  });
}
