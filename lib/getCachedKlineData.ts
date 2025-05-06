// lib/getCachedKlineData.ts

import { firestore } from '@lib/firebase-admin' // 引入你配置的 Firebase Admin SDK

// 获取缓存的 K 线数据
export async function getCachedKlineData(limit = 50) {
  try {
    const snapshot = await firestore
      .collection('kline') // 假设你存储数据的 Firestore 集合名称为 'kline'
      .orderBy('timestamp', 'desc') // 按时间戳降序排序
      .limit(limit)
      .get()

    // 将 Firestore 返回的数据格式化为数组
    const klineData = snapshot.docs.map(doc => doc.data())

    return klineData
  } catch (error) {
    console.error('Error fetching K-line data from Firestore:', error)
    throw new Error('Failed to fetch K-line data from Firestore')
  }
}
