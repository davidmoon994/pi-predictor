// app/api/kline/route.ts（或 pages/api/kline.ts，根据你项目结构）
// app/api/kline/route.ts
import { getFirestore } from '@lib/firebase-admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('kline_data')
      .orderBy('timestamp', 'desc')
      .limit(500)
      .get();

    const data = snapshot.docs.map(doc => doc.data()).reverse(); // 从旧到新
    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('❌ 读取失败:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

