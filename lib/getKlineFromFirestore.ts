// lib/getKlineFromFirestore.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";

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

// ✅ 根据期号获取指定 K 线数据
export async function getKlineFromFirestore(periodId: string): Promise<{
  timestamp: number;
  open: number;
  close: number;
} | null> {
  try {
    const docRef = doc(db, "kline", periodId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    const data = snap.data();
    return {
      timestamp: Number(data.timestamp),
      open: Number(data.open),
      close: Number(data.close),
    };
  } catch (err) {
    console.error("❌ 获取指定期号 K 线数据失败:", err);
    return null;
  }
}

// ✅ 从 'kline/latest' 文档中获取最新价格
export async function getLatestPriceFromFirestore(token: string = "PI"): Promise<number | null> {
  try {
    const docRef = doc(db, "kline", "latest");
    const snap = await getDoc(docRef);

    if (!snap.exists()) return null;

    const data = snap.data();

    if (!Array.isArray(data.data) || data.data.length === 0) return null;

    // 默认取数组中的第一项作为最新数据
    const latestItem = data.data[0];
    return Number(latestItem.close) || null;
  } catch (error) {
    console.error(`❌ 获取 ${token} 最新 K 线收盘价失败:`, error);
    return null;
  }
}
