// app/api/kline/route.ts（或 pages/api/kline.ts，根据你项目结构）
// 返回：最近 200 条数据 + 最新一条（未收盘）数据

import { getFirestore } from '@lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = getFirestore();

    const snapshot = await db
      .collection('kline_data')
      .orderBy('timestamp', 'desc')
      .limit(200)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 });
    }

    const raw = snapshot.docs.map(doc => doc.data());
    const data = raw.reverse(); // 时间升序
    const latest = data[data.length - 1];

    return NextResponse.json({ data, latest });
  } catch (error: any) {
    console.error('❌ 获取 K 线失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

