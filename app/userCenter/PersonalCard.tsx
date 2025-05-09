'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const PersonalCard = () => {
  const [userData, setUserData] = useState<any>(null);
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
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-6">加载中...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">个人账户信息</h2>

      {userData ? (
        <div>
          <div className="flex items-center mb-4">
            <img
              src={userData.avatarUrl || '/default-avatar.png'} // 默认头像
              alt="用户头像"
              className="w-16 h-16 rounded-full mr-4"
            />
            <div>
              <p className="text-lg font-bold">{userData.displayName}</p>
              <p className="text-sm text-gray-400">账户 ID: {userData.uid}</p>
            </div>
          </div>

          <div className="mb-4">
            <p>当前积分：<span className="text-yellow-400 font-bold">{userData.points}</span></p>
          </div>

          <div className="mb-4">
            <p>一级客户：<span className="text-green-400">{userData.referrals ? userData.referrals.length : 0}</span></p>
            <p>二级客户：<span className="text-green-400">{userData.secondLevelReferrals || 0}</span></p>
          </div>

          <div className="mb-4">
            <p>本月利润总额：<span className="text-yellow-400 font-bold">{userData.monthlyProfit || 0} PI</span></p>
          </div>
        </div>
      ) : (
        <p>无法获取用户信息</p>
      )}
    </div>
  );
};

export default PersonalCard;
