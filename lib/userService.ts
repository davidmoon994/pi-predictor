// lib/userService.ts
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, increment,  DocumentData} from 'firebase/firestore';
import { db } from './firebase';

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

// 处理充值/提现
export async function processTransaction(uid, amount, type) {
  const userRef = doc(db, 'users', uid);

  if (type === 'recharge') {
    await updateDoc(userRef, {
      points: increment(amount), // 增加积分
    });

    // 记录充值交易
    const transactionRef = collection(db, 'transactions');
    await setDoc(doc(transactionRef), {
      userId: uid,
      amount,
      type: 'recharge',
      timestamp: new Date(),
    });
  } else if (type === 'withdraw') {
    await updateDoc(userRef, {
      points: increment(-amount), // 减少积分
    });

    // 记录提现交易
    const transactionRef = collection(db, 'transactions');
    await setDoc(doc(transactionRef), {
      userId: uid,
      amount,
      type: 'withdraw',
      timestamp: new Date(),
    });
  }
}
