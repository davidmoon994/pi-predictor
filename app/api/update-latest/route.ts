//app/api/update-latest/route.ts

//Next.js 15 App Router + Vercel Cron Job 方案,每分钟自动执行，拉取最新 K 线数据并写入 Firestore 的 kline/latest 文档

import { NextResponse } from 'next/server';
import { getFirestore } from '../../../lib/firebase-admin';
import { fetchLatestKlineFromGate } from '../../../lib/fetchAndCacheKline';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const klineRef = db.collection('kline').doc('latest');
    const doc = await klineRef.get();

    let existingData: any[] = [];
    if (doc.exists) {
      const docData = doc.data();
      existingData = docData?.data ?? [];
    }

    // 拉最新单条数据
    const latestKline = await fetchLatestKlineFromGate();
    if (!latestKline) {
      return NextResponse.json({ message: '未获取到最新K线数据' }, { status: 500 });
    }

    // 判断是否已经存在该条数据，避免重复插入
    const latestTimestamp = latestKline.timestamp;
    const hasLatest = existingData.some(item => item.timestamp === latestTimestamp);
    if (hasLatest) {
      // 已存在，直接返回当前数据
      return NextResponse.json(existingData);
    }

    // 插入最新数据到数组开头，并保持最多50条
    const newData = [latestKline, ...existingData];
    if (newData.length > 50) {
      newData.length = 50;
    }

    // 写回 Firestore
    await klineRef.set({
      data: newData,
      timestamp: new Date(),
    });

    return NextResponse.json(newData);

  } catch (error: any) {
    console.error('❌ update-latest 错误:', error);
    return NextResponse.json({ message: '更新失败', error: error.message }, { status: 500 });
  }
}

