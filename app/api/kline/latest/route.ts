//app/api/kline/latest/route.ts

// 获取 Firestore 中最新一条收盘价
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

    if (!Array.isArray(fullData) || fullData.length === 0) {
      return NextResponse.json({ message: '数据为空或格式错误' }, { status: 500 });
    }

    const latest = fullData[0];

    if (!latest || typeof latest.close === 'undefined') {
      return NextResponse.json({ message: '缺少收盘价字段' }, { status: 500 });
    }

    return NextResponse.json({ close: latest.close });
  } catch (error: any) {
    return NextResponse.json(
      { message: '获取失败', error: error.message },
      { status: 500 }
    );
  }
}



