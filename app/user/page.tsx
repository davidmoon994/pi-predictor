"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function UserCenter() {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const myCode = userSnap.data().inviteCode;
          setInviteCode(myCode);

          // 查询下级用户
          const q = query(collection(db, "users"), where("invitedBy", "==", myCode));
          const querySnapshot = await getDocs(q);

          const list: any[] = [];
          querySnapshot.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });

          setReferrals(list);
        }
        setLoading(false);
      } else {
        alert("请先登录");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white p-6">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">用户中心</h1>

      {inviteCode ? (
        <>
          <div className="mb-6">
            <p>我的邀请码：</p >
            <div className="bg-gray-800 p-2 rounded text-green-400 text-lg">{inviteCode}</div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">我的下级用户：</h2>
            {referrals.length > 0 ? (
              <ul className="space-y-2">
                {referrals.map((user) => (
                  <li key={user.uid} className="bg-gray-800 p-3 rounded">
                    {user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无下级用户</p >
            )}
          </div>
        </>
      ) : (
        <p>无法获取邀请码，请检查是否已注册成功</p >
      )}
    </div>
  );
}