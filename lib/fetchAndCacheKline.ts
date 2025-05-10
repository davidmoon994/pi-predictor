// ✅ 使用 firebase-admin 初始化 Firestore
import { db } from './firebase-admin'
import { Timestamp, serverTimestamp } from 'firebase-admin/firestore'

// ✅ 自动重试 fetch 工具函数
async function fetchWithRetry(url: string, retries = 3, delay = 2000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res
      throw new Error(`响应失败：${res.status}`)
    } catch (err) {
      if (i === retries - 1) throw err
      console.warn(`⚠️ 第 ${i + 1} 次请求失败，重试中... (${delay}ms)`)
      await new Promise((r) => setTimeout(r, delay))
    }
  }
  throw new Error('所有请求均失败')
}

export async function fetchAndCacheKline() {
  console.log('📥 开始拉取 Gate.io K 线数据...')
  const url = 'https://api.gate.io/api/v4/spot/candlesticks?currency_pair=PI_USDT&interval=5m&limit=1'

  const res = await fetchWithRetry(url)
  const data = await res.json()

  const [timestamp, volume, close, high, low, open] = data[0]
  const klineData = {
    timestamp: Number(timestamp) * 1000,
    volume,
    close,
    high,
    low,
    open,
    createdAt: serverTimestamp(),
  }

  console.log('📤 写入 Firestore：', klineData)

  await db.collection('kline').doc(String(klineData.timestamp)).set(klineData, { merge: true })
  console.log('✅ K线数据成功获取并存储')
}