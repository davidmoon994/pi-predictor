// lib/userService.ts
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase'; // 确保引入 auth
// 定义 Commission 类型
type Commission = {
  id: string;
  userId: string;
  sourceUserId: string;
  amount: number;
  type: string;
  createdAt: string;
};

export interface User {
  uid: string;
  // 其他属性
}

// 获取用户数据
export async function getUserData(): Promise<UserData | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const docRef = doc(db, 'users', currentUser.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { uid: currentUser.uid, ...docSnap.data() } as UserData;
  }

  return null;
}



// 获取分润记录
export async function getCommissionData(userId: string): Promise<Commission[]> {
  const commissionsRef = collection(db, 'commissions');  // 获取 'commissions' 集合
  const q = query(commissionsRef, where('userId', '==', userId));  // 根据 userId 查询佣金记录

  const querySnapshot = await getDocs(q);  // 获取查询结果
  const commissions = querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,  // Firestore 文档 ID
      userId: data.userId,  // 假设佣金记录包含 userId 字段
      sourceUserId: data.sourceUserId,  // 来源用户 ID
      amount: data.amount,  // 金额
      type: data.type,  // 佣金类型
      createdAt: data.createdAt,  // 佣金记录创建时间
    };
  });

  return commissions;
}

// 用户申请充值或提现，初始 status 为 pending
export async function requestTransaction(uid: string, amount: number, type: 'recharge' | 'withdraw') {
  await addDoc(collection(db, 'transactions'), {
    userId: uid,
    amount,
    type,
    status: 'pending', // 等待管理员审核
    timestamp: Date.now(),
  });
}

// 获取用户充值/提现记录（用于前台展示历史记录）
export async function getUserTransactions(uid: string) {
  const q = query(collection(db, 'transactions'), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}