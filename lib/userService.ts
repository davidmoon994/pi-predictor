// lib/userService.ts
import {
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserData, Commission, WalletTransaction } from './types';

// 获取当前登录用户数据
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

// 获取指定用户的分润记录
export async function getCommissionData(userId: string): Promise<Commission[]> {
  if (!userId) return [];
  const commissionsRef = collection(db, 'commissions');
  const q = query(commissionsRef, where('userId', '==', userId));

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      sourceUserId: data.sourceUserId,
      fromUserName: data.fromUserName,
      amount: data.amount,
      type: data.type,
      timestamp: data.timestamp,
    };
  });
}

// 申请充值或提现
export async function requestTransaction(
  uid: string,
  amount: number,
  type: 'recharge' | 'withdraw',
  accountId?: string
): Promise<void> {
  if (!uid || !amount || !type) throw new Error('无效的交易参数');

  await addDoc(collection(db, 'transactions'), {
    userId: uid,
    amount,
    type,
    status: 'pending',
    accountId: accountId || '',
    timestamp: serverTimestamp(),
  });
}

// 获取用户的所有交易记录
export async function getUserTransactions(uid: string): Promise<WalletTransaction[]> {
  if (!uid) return [];

  const q = query(collection(db, 'transactions'), where('userId', '==', uid));
  const snap = await getDocs(q);

  return snap.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<WalletTransaction, 'id'>),
  }));
}

// 获取某管理员下的一级客户及其客户信息
export async function getClientHierarchyWithDetails(adminUid: string) {
  if (!adminUid) return [];

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('inviterId', '==', adminUid));
  const snapshot = await getDocs(q);

  const clients = await Promise.all(snapshot.docs.map(async doc => {
    const clientId = doc.id;
    const clientData = doc.data();

    // 获取一级客户的一级客户（即二级客户）
    const level1Query = query(usersRef, where('inviterId', '==', clientId));
    const level1Snapshot = await getDocs(level1Query);

    const level2Clients = await Promise.all(level1Snapshot.docs.map(async subDoc => {
      const level2Id = subDoc.id;

      const betSnap = await getDocs(query(collection(db, 'bets'), where('userId', '==', level2Id)));
      const totalBets = betSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

      const commissionSnap = await getDocs(query(collection(db, 'commissions'), where('userId', '==', adminUid), where('sourceUserId', '==', level2Id)));
      const totalCommissions = commissionSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

      return {
        id: level2Id,
        totalBets,
        totalCommissions,
      };
    }));

    const level1Clients = await Promise.all(level1Snapshot.docs.map(async level1Doc => {
      const level1Id = level1Doc.id;

      const betSnap = await getDocs(query(collection(db, 'bets'), where('userId', '==', level1Id)));
      const totalBets = betSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

      const commissionSnap = await getDocs(query(collection(db, 'commissions'), where('userId', '==', adminUid), where('sourceUserId', '==', level1Id)));
      const totalCommissions = commissionSnap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);

      return {
        id: level1Id,
        totalBets,
        totalCommissions,
      };
    }));

    return {
      id: clientId,
      points: clientData.points || 0,
      level1Clients,
      level2Clients,
    };
  }));

  return clients;
}
