// app/api/kline/route.ts（或 pages/api/kline.ts，根据你项目结构）
import { NextResponse } from 'next/server';
import { getLatestKlines } from '../../../lib/klineService';

export async function GET() {
  const data = await getLatestKlines();

  if (data) {
    return NextResponse.json({ data });
  } else {
    return NextResponse.json({ error: 'K线数据不存在' }, { status: 404 });
  }
}
