// lib/klineService.ts
import { db } from './firebase-admin';

export async function getLatestKlines(): Promise<any[] | null> {
  try {
    const docRef = db.collection('kline').doc('latest');
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const data = docSnap.data();
      console.log('🔥 最新 K 线数据:', data);

      // 确保返回的是数组
      if (data && Array.isArray(data.data)) {
        return data.data;  // 返回 Firestore 中存储的 K 线数据数组
      } else {
        console.warn('Firestore 中的数据不是有效的数组');
        return [];  // 如果数据不是有效的数组，返回空数组
      }
    } else {
      console.warn('没有找到最新的 K 线数据');
      return [];  // 如果文档不存在，返回空数组
    }
  } catch (error) {
    console.error('获取 K 线数据失败:', error);
    return [];  // 如果出现错误，返回空数组
  }
}
