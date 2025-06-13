//app/userCenter/UserCenterClient.tsx
'use client';

import { useEffect } from 'react';
import { auth, db } from '@lib/firebase';
import { Timestamp } from 'firebase/firestore'; // 确保有这一行
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { UserData,  BetRecord } from '@lib/types';

interface Props {
  onData: (params: {
    userData: UserData;
    referrals: UserData[];
    secondLevelUsers: UserData[];
    bets: BetRecord[];
    commissions: Commission[]; // ✅ 加上这个
  }) => void;
}
type Commission = {
  id: string;
  userId: string;
  sourceUserId: string;
  fromUserName?: string;
  amount: number;
  type: 'level1' | 'level2';
  timestamp: number;
};


const UserCenterClient = ({ onData }: Props) => {
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('🔥 当前用户:', user); // ← 加这个
      if (!user) return;

      // 获取当前用户数据
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      const userInfo = { uid: user.uid, ...userSnap.data() } as UserData;

      // 获取一级客户（直接邀请）
      const refQuery = query(collection(db, 'users'), where('invitedBy', '==', userInfo.inviteCode));
      const refSnap = await getDocs(refQuery);
      const refUsers = refSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserData[];

      // 获取二级客户（一级客户邀请的客户）
      const secondLevelResults = await Promise.all(refUsers.map(async r => {
        const q = query(collection(db, 'users'), where('invitedBy', '==', r.inviteCode));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as UserData[];
      }));
      const secondLevelUsers = secondLevelResults.flat();

      // 获取佣金记录
const commissionQuery = query(collection(db, 'commissions'), where('toUserId', '==', user.uid));
const commissionSnap = await getDocs(commissionQuery);

const rawCommissions = commissionSnap.docs.map((doc) => ({
  id: doc.id,
  ...(doc.data() as any),
}));

// 如果你的组件要用的是 Commission类型（包含 level、fromUserId、period），补全它：
const commissions: Commission[] = rawCommissions.map((c) => ({
  id: c.id,
  userId: c.toUserId, // ✅ 正确字段名
  sourceUserId: c.sourceUserId ?? '', // ✅ 正确字段名
  fromUserId: c.sourceUserId ?? '', // 填补缺失字段
  fromUserName: c.fromUserName ?? '',
  amount: c.amount,
  type: c.type ?? 'level1',
  level: c.level ?? 1,
  period: c.period ?? '',
  timestamp: typeof c.timestamp === 'number' ? c.timestamp : (c.timestamp as Timestamp).toMillis(),
}));

      
      

      // 获取投注记录
      const betQuery = query(collection(db, 'bets'), where('userId', '==', user.uid));
      const betSnap = await getDocs(betQuery);
      const bets = betSnap.docs.map(doc => doc.data() as BetRecord);

      // 传递给page.tsx
      onData({ userData: userInfo, referrals: refUsers, secondLevelUsers, commissions, bets });
    });

    return () => unsubscribe();
  }, [onData]);

  return null;
};

export default UserCenterClient;
