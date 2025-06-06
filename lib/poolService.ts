// lib/poolService.ts
import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// 初始化奖池（首次创建该期时调用）
export const initPoolIfNotExists = async (period: string): Promise<void> => {
  const poolRef = doc(db, 'pools', period);
  const poolSnap = await getDoc(poolRef);
  if (!poolSnap.exists()) {
    await setDoc(poolRef, {
      upAmount: 0,
      downAmount: 0,
      totalAmount: 0,
      createdAt: serverTimestamp(),
    });
  }
};

// 用户下注后更新奖池金额
export const updatePoolAfterBet = async (
  period: string,
  direction: 'up' | 'down',
  amount: number
): Promise<void> => {
  const poolRef = doc(db, 'pools', period);
  const poolSnap = await getDoc(poolRef);

  if (!poolSnap.exists()) {
    await setDoc(poolRef, {
      upAmount: direction === 'up' ? amount : 0,
      downAmount: direction === 'down' ? amount : 0,
      totalAmount: amount,
      createdAt: serverTimestamp(),
    });
  } else {
    const data = poolSnap.data();
    const newUp = data.upAmount || 0;
    const newDown = data.downAmount || 0;

    await updateDoc(poolRef, {
      upAmount: direction === 'up' ? newUp + amount : newUp,
      downAmount: direction === 'down' ? newDown + amount : newDown,
      totalAmount: (data.totalAmount || 0) + amount,
    });
  }
};

// 获取奖池总金额
export async function fetchPoolAmount(periodId: string) {
  if (!periodId || typeof periodId !== 'string') {
    throw new Error('periodId must be a string');
  }

  const docRef = doc(db, 'pools', periodId); // ✅ 使用传入参数 periodId
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data().amount : 0;
}


// 获取奖池详情
export const getPoolDetail = async (period: string) => {
  const poolDoc = await getDoc(doc(db, 'pools', period));
  return poolDoc.exists() ? poolDoc.data() : null;
};

// （可选）结算后清空奖池金额
export const clearPoolAfterSettle = async (period: string) => {
  await updateDoc(doc(db, 'pools', period), {
    upAmount: 0,
    downAmount: 0,
    totalAmount: 0,
    clearedAt: Date.now(),
  });
};
