//lib/fetchAndCacheKline.ts
import https from 'https';
import { db } from './firebase-admin';

export async function fetchAndCacheKlinesFromGate(): Promise<any[]> {
  const url = 'https://api.gateio.ws/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=50';

  return new Promise((resolve, reject) => {
    https.get(url, async (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', async () => {
        try {
          const parsed = JSON.parse(data);
          console.log('🔥 成功解析 Gate.io 返回的数据:', parsed);

          const klineData = parsed.map((item: (string | number)[]) => ({
            timestamp: Number(item[0]),       // ✅ 时间戳（秒）
            volume: parseFloat(String(item[1])),  // ✅ 成交量（币）
            close: parseFloat (String(item[2])),     // ✅ 收盘价
            high: parseFloat (String(item[3])),       // ✅ 最高价
            low: parseFloat (String(item[4])),     // ✅ 最低价
            open: parseFloat (String(item[5])),   // ✅ 开盘价（注意是 item[5]）
            quoteVolume: parseFloat (String(item[6])),// ✅ 成交额（USDT）
            isClosed: true,
          }));
          
          
          

          console.log('🔥 准备写入 Firestore：', klineData);

          const klineRef = db.collection('kline').doc('latest');
          await klineRef.set({
            data: klineData,
            timestamp: new Date()
          });

          console.log('🔥 K线数据成功写入 Firestore！');
          resolve(klineData);
        } catch (err) {
          console.error('🔥 JSON 解析失败:', err);
          reject(new Error('解析响应失败'));
        }
      });
    }).on('error', (err) => {
      console.error('🔥 HTTPS 请求错误:', err);
      reject(new Error('请求失败'));
    });
  });
}
