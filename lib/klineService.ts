// lib/klineService.ts
import { getCachedKlineData } from './getKlineFromFirestore'
import { fetchAndCacheKline } from './fetchAndCacheKline'

export async function getKlineData() {
  let cached = await getCachedKlineData()

  // 如果缓存无数据，或时间戳超过5分钟则刷新
  const now = Date.now()
  const maxAge = 5 * 60 * 1000

  const isStale =
    !cached || cached.length === 0 ||
    (cached[0]?.timestamp && now - cached[0].timestamp > maxAge)

  if (isStale) {
    console.log('📡 Fetching fresh K-line data...')
    await fetchAndCacheKline()
    cached = await getCachedKlineData()
  }

  return cached || []
}

