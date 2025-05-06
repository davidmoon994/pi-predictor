// lib/getKlineFromFirestore.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


// ✅ 只初始化一次 Firebase 应用
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * 获取最近 50 条 K 线数据（升序）
 * 返回数据应包含：timestamp、open、high、low、close、volume 等字段
 */
export async function getKlineFromFirestore() {
  const q = query(
    collection(db, 'kline'),
    orderBy('timestamp', 'desc'),
    limit(50)
  );

  const querySnapshot = await getDocs(q);
  const data: any[] = [];

  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  return data.reverse(); // 以时间升序返回，便于图表渲染
}

/**
 * 获取最新一条缓存的 K 线数据（可用于判断更新）
 */
export async function getCachedKlineData() {
  const q = query(
    collection(db, 'kline'),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  } else {
    throw new Error('No kline data found in Firestore');
  }
}
