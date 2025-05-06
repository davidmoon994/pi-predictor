// app/api/cache-kline/route.ts
import { NextResponse } from 'next/server';
import { cacheKlineData } from '@lib/fetchAndCacheKline';

export async function GET() {
  try {
    await cacheKlineData();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('缓存 K 线失败:', error);
    return NextResponse.json({ error: '缓存 K 线失败' }, { status: 500 });
  }
}
