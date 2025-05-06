// app/api/kline/route.ts
import { NextResponse } from 'next/server'
import { getKlineData } from '@lib/klineService'

export const dynamic = 'force-dynamic'

export async function GET() {
  console.log('✅ [API] GET /api/kline started')

  try {
    const data = await getKlineData()

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, message: 'No K-line data available' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: data.map((item: any) => [
        item.timestamp / 1000,
        item.volume,
        item.open,
        item.high,
        item.low,
        item.close,
      ]),
    })
  } catch (error) {
    console.error('❌ Error in /api/kline:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
