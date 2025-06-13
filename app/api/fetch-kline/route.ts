// app/api/fetch-kline/route.ts

import { fetchAndAppendLatestKline } from '@lib/fetchAndCacheKline';
import { NextResponse } from 'next/server';

// ⏰ 定时任务配置（每分钟执行）
export const config = {
  schedule: '* * * * *',
};

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await fetchAndAppendLatestKline();

    if (result) {
      return NextResponse.json({ message: '成功写入最新K线', data: result });
    } else {
      return NextResponse.json({ message: '没有新数据，无需写入' });
    }
  } catch (error: any) {
    console.error('❌ fetch-kline 错误:', error);
    return NextResponse.json({ message: '写入失败', error: error.message }, { status: 500 });
  }
}
