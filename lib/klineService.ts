// lib/klineService.ts
import { getKlineFromFirestore } from './getKlineFromFirestore'
import { fetchAndCacheKline } from './fetchAndCacheKline'

export async function getKlineData() {
  let cached = await getKlineFromFirestore() // ✅ 修改这里！

  const now = Date.now()
  const maxAge = 5 * 60 * 1000

  const isStale =
    !cached || cached.length === 0 ||
    (cached[0]?.timestamp && now - cached[0].timestamp > maxAge)

  if (isStale) {
    console.log('📡 Fetching fresh K-line data...')
    await fetchAndCacheKline()
    cached = await getKlineFromFirestore() // ✅ 再次使用这个
  }

  return cached || []
}
