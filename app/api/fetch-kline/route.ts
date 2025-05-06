import { NextResponse } from 'next/server'
import { fetchAndCacheKline } from '@lib/fetchAndCacheKline'

export async function GET() {
  try {
    console.log('📡 API 请求开始：GET /api/fetch-kline')
    await fetchAndCacheKline()
    console.log('✅ K线数据成功获取并存储')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ API 错误：', error)
    return NextResponse.json({ success: false, error: String(error) })
  }
}
