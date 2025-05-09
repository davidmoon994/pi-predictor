//app/userCenter/UserCenterPage.tsx

'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { doc, getDoc, query, where, getDocs, updateDoc, collection } from 'firebase/firestore';
import QRCode from 'qrcode.react';
import { placeBet } from '@lib/betService';
import { drawAndSettle } from '@lib/drawService';

const UserCenter = () => {
  const [userData, setUserData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [selection, setSelection] = useState<'up' | 'down'>('up');
  const [loading, setLoading] = useState(true);
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        alert('请先登录');
        setLoading(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = { uid: user.uid, ...userSnap.data() };
        setUserData(userInfo);
        setInviteLink(`${window.location.origin}/register?inviterId=${userInfo.inviteCode}`);

        const refQuery = query(collection(db, 'users'), where('invitedBy', '==', userInfo.inviteCode));
        const refSnap = await getDocs(refQuery);
        const refUsers = refSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setReferrals(refUsers);

        const betQuery = query(collection(db, 'bets'), where('userId', '==', user.uid));
        const betSnap = await getDocs(betQuery);
        setMyBets(betSnap.docs.map(doc => doc.data()));

        const commissionQuery = query(collection(db, 'commissions'), where('toUserId', '==', user.uid));
        const commissionSnap = await getDocs(commissionQuery);
        setCommissions(commissionSnap.docs.map(doc => doc.data()));
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-6">加载中...</div>;
  if (!userData) return <div className="text-white p-6">无法获取用户信息</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-200 to-red-300 p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* 明信片1：账户信息 */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-yellow-400">
        <h2 className="font-bold text-lg mb-2">账户信息</h2>
        <p><strong>ID:</strong> {userData.uid}</p>
        <p><strong>积分:</strong> {userData.points}</p>
        <p><strong>一级客户数:</strong> {referrals.length}</p>
        <p><strong>二级客户数:</strong> {referrals.reduce((total, r) => total + (r.referrals?.length || 0), 0)}</p>
        <p><strong>本月利润:</strong> {commissions.reduce((sum, c) => sum + (c.amount || 0), 0)} PI</p>
      </div>

      {/* 明信片2：客户信息 */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-green-400 overflow-y-auto max-h-80">
        <h2 className="font-bold text-lg mb-2">客户信息</h2>
        {referrals.map((r, idx) => (
          <div key={idx} className="mb-2">
            <p className="text-sm">一级客户: {r.displayName || r.uid}</p>
            {(r.referrals || []).map((s: any, i: number) => (
              <p key={i} className="text-xs text-gray-500 ml-2">二级: {s.displayName || s.uid}</p>
            ))}
          </div>
        ))}
      </div>

      {/* 明信片3：分润日志 */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-blue-400 overflow-y-auto max-h-80">
        <h2 className="font-bold text-lg mb-2">分润记录</h2>
        {commissions.length > 0 ? commissions.map((c, idx) => (
          <div key={idx} className="text-sm mb-1">
            <p>{c.fromUserEmail || '匿名'} 分润 {c.amount} PI [{c.type}]</p>
          </div>
        )) : <p className="text-gray-400">暂无记录</p>}
      </div>

      {/* 明信片4：二维码与邀请链接 */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-purple-400 flex flex-col items-center">
        <h2 className="font-bold text-lg mb-2">邀请链接</h2>
        <QRCode value={inviteLink} size={128} />
        <p className="mt-2 break-words text-sm text-center">{inviteLink}</p>
      </div>

      {/* 明信片5：充值与提现 */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-indigo-400">
        <h2 className="font-bold text-lg mb-2">账户操作</h2>
        <button className="bg-green-500 text-white px-4 py-2 rounded mb-2 w-full">充值</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded w-full">提现</button>
      </div>

      {/* 明信片6：投注记录 */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-400 overflow-y-auto max-h-80">
        <h2 className="font-bold text-lg mb-2">投注记录</h2>
        {myBets.length > 0 ? myBets.map((b, idx) => (
          <div key={idx} className="text-sm mb-1">
            <p>{b.timestamp?.slice(0, 10)} [{b.selection}] 投 {b.amount} PI</p>
          </div>
        )) : <p className="text-gray-400">暂无投注记录</p>}
      </div>
    </div>
  );
};

export default UserCenter;
