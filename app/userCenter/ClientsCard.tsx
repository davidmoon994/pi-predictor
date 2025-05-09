'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@lib/firebase';
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';

const ClientsCard = () => {
  const [userData, setUserData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [secondLevelReferrals, setSecondLevelReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (!user) {
          alert("请先登录");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.warn("用户数据不存在");
          setLoading(false);
          return;
        }

        const userInfo = userSnap.data();
        setUserData(userInfo);

        // 获取一级客户
        const refQuery = query(
          collection(db, "users"),
          where("invitedBy", "==", userInfo.inviteCode)
        );
        const refSnap = await getDocs(refQuery);
        const level1 = refSnap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
        setReferrals(level1);

        // 获取二级客户
        const secondLevelUsers = await getSecondLevelUsers(level1);
        setSecondLevelReferrals(secondLevelUsers);
      } catch (error) {
        console.error("加载客户失败:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getSecondLevelUsers = async (level1Users: any[]) => {
    const allLevel2: any[] = [];

    for (const user of level1Users) {
      if (!user.inviteCode) continue;

      const q = query(collection(db, "users"), where("invitedBy", "==", user.inviteCode));
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        allLevel2.push({ uid: doc.id, ...doc.data() });
      });
    }

    return allLevel2;
  };

  if (loading) return <div className="text-white p-6">加载中...</div>;

  return (
    <div className="bg-gray-800 p-6 rounded-lg text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">客户信息</h2>

      {userData ? (
        <div>
          <div className="mb-4">
            <p className="text-lg font-semibold">一级客户</p>
            {referrals.length > 0 ? (
              <ul className="space-y-2">
                {referrals.map((ref, idx) => (
                  <li key={idx} className="bg-gray-700 p-4 rounded">
                    <p className="text-sm">用户名: {ref.displayName || "未设置"}</p>
                    <p className="text-sm">账户ID: {ref.uid}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无一级客户</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-lg font-semibold">二级客户</p>
            {secondLevelReferrals.length > 0 ? (
              <ul className="space-y-2">
                {secondLevelReferrals.map((ref, idx) => (
                  <li key={idx} className="bg-gray-700 p-4 rounded">
                    <p className="text-sm">用户名: {ref.displayName || "未设置"}</p>
                    <p className="text-sm">账户ID: {ref.uid}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无二级客户</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-red-400">无法获取用户信息</p>
      )}
    </div>
  );
};

export default ClientsCard;
