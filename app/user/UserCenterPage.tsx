'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { doc, getDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { placeBet } from "@lib/betService"; // 确保下注服务已在 betService �?
import { drawAndSettle } from "@lib/drawService"; // 引入 drawAndSettle 逻辑

const UserCenter = () => {
  const [userData, setUserData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [childBets, setChildBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        alert("请先登录");
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        setUserData(userInfo);

        // 获取用户自己下注记录
        const betsRef = query(collection(db, "bets"), where("userId", "==", user.uid));
        const myBetDocs = await getDocs(betsRef);
        setMyBets(myBetDocs.docs.map((doc) => doc.data()));

        // 获取下级用户
        const refQuery = query(collection(db, "users"), where("invitedBy", "==", userInfo.inviteCode));
        const refSnap = await getDocs(refQuery);
        const refUsers = refSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
        setReferrals(refUsers);

        // 获取下级用户下注记录
        const refIds = refUsers.map((u) => u.uid);
        const childBetDocs = await getDocs(collection(db, "bets"));
        const childBetList = childBetDocs.docs.map(doc => doc.data()).filter(bet => refIds.includes(bet.userId));
        setChildBets(childBetList);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBetConfirm = async () => {
    if (!userData || !userData.inviteCode) return;

    // 从当前投注记录获得相关信�?
    const amount = Number(betAmount);
    if (amount <= 0 || amount > userData.points) return alert('积分不足');

    // 更新用户积分，下注记录，分润系统
    await placeBet(amount, selection, period); // 执行下注操作
    await updateReferralBonus(userData.inviteCode, amount); // 执行分润操作

    alert("投注成功");
    // 更新投注记录和余�?
    setUserData((prev) => ({
      ...prev,
      points: prev.points - amount,
    }));
  };

  const updateReferralBonus = async (inviteCode: string, amount: number) => {
    const refQuery = query(collection(db, "users"), where("inviteCode", "==", inviteCode));
    const refSnap = await getDocs(refQuery);

    if (refSnap.empty) return;

    const refUser = refSnap.docs[0];
    await updateDoc(refUser.ref, {
      points: refUser.data().points + Math.floor(amount * 0.02), // 一级推荐人返还 2%
    });

    const secondLevelUser = refUser.data().invitedBy;
    if (secondLevelUser) {
      const secondRefQuery = query(collection(db, "users"), where("inviteCode", "==", secondLevelUser));
      const secondRefSnap = await getDocs(secondRefQuery);
      if (!secondRefSnap.empty) {
        const secondRefUser = secondRefSnap.docs[0];
        await updateDoc(secondRefUser.ref, {
          points: secondRefUser.data().points + Math.floor(amount * 0.01), // 二级推荐人返�?1%
        });
      }
    }
  };

  if (loading) return <div className="text-white p-6">加载�?..</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">用户中心</h1>

      {userData ? (
        <>
          <div className="mb-6">
            <p>邀请码�?/p>
            <div className="bg-gray-800 p-2 rounded text-green-400 text-lg">{userData.inviteCode}</div>
          </div>

          <div className="mb-6">
            <p>当前积分�?span className="text-yellow-400 font-bold">{userData.points}</span></p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">我的投注记录�?/h2>
            {myBets.length > 0 ? (
              <ul className="space-y-2">
                {myBets.map((bet, idx) => (
                  <li key={idx} className="bg-gray-800 p-3 rounded">
                    [{bet.selection}] 投注 {bet.amount} PI
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无投注记录</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">下级用户投注记录�?/h2>
            {childBets.length > 0 ? (
              <ul className="space-y-2">
                {childBets.map((bet, idx) => (
                  <li key={idx} className="bg-gray-800 p-3 rounded">
                    {bet.email} [{bet.selection}] 投注 {bet.amount} PI
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无下级投注</p>
            )}
          </div>
        </>
      ) : (
        <p>无法获取用户信息</p>
      )}
    </div>
  );
};

export default UserCenter;
