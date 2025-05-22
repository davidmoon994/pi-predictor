// app/api/fetch-kline/route.ts
import { fetchAndCacheKlinesFromGate } from '@lib/fetchAndCacheKline';
import { getFirestore } from '@lib/firebase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 60 * 1000; // 60 秒缓存时间



export async function GET() {
  console.log('🔥 FIREBASE_SERVICE_ACCOUNT_BASE64 前 30 字符：', process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.slice(0, 30));

  try {
    const db = getFirestore();
    const klineDoc = await db.collection('kline').doc('latest').get();

    if (klineDoc.exists) {
      const cachedData = klineDoc.data();

      if (cachedData?.data && cachedData?.timestamp) {
        const now = Date.now();
        const lastUpdated =
          typeof cachedData.timestamp.toMillis === 'function'
            ? cachedData.timestamp.toMillis()
            : new Date(cachedData.timestamp).getTime();

        const isExpired = now - lastUpdated > CACHE_TTL_MS;

        if (!isExpired) {
          console.log('✅ 使用缓存的 K 线数据');
          return NextResponse.json(cachedData.data);
        }
      }
    }

    console.log('⏳ 缓存失效或不存在，拉取新的 K 线数据...');
    const freshData = await fetchAndCacheKlinesFromGate();
    return NextResponse.json(freshData);

  } catch (error: any) {
    console.error('❌ fetch-kline 错误:', error);
    return NextResponse.json({ message: '获取失败', error: error.message }, { status: 500 });
  }
}
