'use client';

import { useEffect, useState } from 'react';
import { db } from '@lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

const ReferralCard = () => {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [secondLevelReferrals, setSecondLevelReferrals] = useState<any[]>([]);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          alert("请先登录");
          return;
        }

        // 获取一级客户
        const refQuery = query(collection(db, 'users'), where('invitedBy', '==', user.uid));
        const refSnapshot = await getDocs(refQuery);
        const refUsers = refSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        setReferrals(refUsers);

        // 获取二级客户（从一级客户获取其邀请的下级）
        const secondLevelUsers = [];
        for (const ref of refUsers) {
          const secondRefQuery = query(collection(db, 'users'), where('invitedBy', '==', ref.uid));
          const secondRefSnapshot = await getDocs(secondRefQuery);
          secondRefSnapshot.docs.forEach(doc => secondLevelUsers.push({ uid: doc.id, ...doc.data() }));
        }
        setSecondLevelReferrals(secondLevelUsers);

      } catch (error) {
        console.error("获取客户数据失败:", error);
      }
    };

    fetchReferralData();
  }, []);

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">客户信息</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold">一级客户</h3>
        {referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((ref, idx) => (
              <li key={idx} className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <p>{ref.displayName}</p>
                  <p className="text-yellow-400">{ref.email}</p>
                </div>
                <p>邀请码：{ref.inviteCode}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无一级客户</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">二级客户</h3>
        {secondLevelReferrals.length > 0 ? (
          <ul className="space-y-2">
            {secondLevelReferrals.map((ref, idx) => (
              <li key={idx} className="bg-gray-700 p-4 rounded">
                <div className="flex justify-between">
                  <p>{ref.displayName}</p>
                  <p className="text-yellow-400">{ref.email}</p>
                </div>
                <p>邀请码：{ref.inviteCode}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">暂无二级客户</p>
        )}
      </div>
    </div>
  );
};

export default ReferralCard;
