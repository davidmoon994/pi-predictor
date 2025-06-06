// app/api/kline/short/route.ts
import { getFirestore } from '../../../../lib/firebase-admin';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getFirestore();
    const doc = await db.collection('kline').doc('latest').get();

    if (!doc.exists) {
      return NextResponse.json({ message: 'K线数据不存在' }, { status: 404 });
    }

    const fullData = doc.data()?.data;

    if (!Array.isArray(fullData)) {
      return NextResponse.json({ message: '数据格式错误' }, { status: 500 });
    }

    const shortData = fullData.slice(0, 10); // 只取前 10 条

    return NextResponse.json(shortData);
  } catch (error: any) {
    return NextResponse.json(
      { message: '获取失败', error: error.message },
      { status: 500 }
    );
  }
}
