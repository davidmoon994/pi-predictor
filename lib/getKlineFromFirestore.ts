// lib/getKlineFromFirestore.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function getLatestPriceFromFirestore(): Promise<number | null> {
  const data = await getKlineFromFirestore();
  return data?.[data.length - 1]?.close ?? null;
}


export const getKlineFromFirestore = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'kline'), orderBy('timestamp', 'desc'), limit(50))
    );

    const docs = snapshot.docs.map((doc) => doc.data());

    if (!docs.length) return [];

    const rawArray = docs[0].data;
    console.log('📦 Firestore 返回的数据结构:', docs[0]);
    console.log('📦 rawArray 类型:', typeof rawArray, Array.isArray(rawArray));

    // ✅ 清洗数据
    const cleanedData = rawArray.map((item: any) => ({
      timestamp: Number(item.timestamp),
      open: item.open,
      close: item.close,
    }));

    return cleanedData;
  } catch (error) {
    console.error('❌ 获取 K 线数据失败:', error);
    return [];
  }
};
