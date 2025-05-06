"use client";
import React, { useEffect, useState } from "react";
import UserCenter from "./UserCenterPage";
import { auth, db } from "@lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
const [showQRCode, setShowQRCode] = useState(false);
const inviteLink = `${typeof window !== "undefined" ? window.location.origin : ""}/register?code=${userData?.inviteCode}`;

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  increment
} from "firebase/firestore";

export default function UserCenterPage() {
  const [userData, setUserData] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);

          // 获取一级邀请用户
          const q = query(collection(db, "users"), where("invitedBy", "==", data.inviteCode));
          const res = await getDocs(q);
          const list: any[] = [];
          res.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
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

  const handleTransaction = async (type: "recharge" | "withdraw") => {
    if (!amount || isNaN(Number(amount))) return alert("请输入有效金额");
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      points: increment(type === "recharge" ? Number(amount) : -Number(amount))
    });

    alert(type === "recharge" ? "充值成功！" : "提现申请已提交！");
    setAmount("");
    setShowRecharge(false);
    setShowWithdraw(false);
    window.location.reload();
  };

  if (loading) return <div className="text-white p-6">加载中...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <UserCenter />
      <h1 className="text-2xl font-bold mb-4">用户中心</h1>

      {userData ? (
        <>
          {/* 用户信息卡片 */}
          <div className="bg-gray-800 p-4 rounded mb-6">
            <div className="flex items-center space-x-4">
              <img
                src={userData.photoURL}
                alt="头像"
                className="w-14 h-14 rounded-full border-2 border-white"
              />
              <div>
                <p className="font-semibold">等级：Lv.{userData.level || 1}</p>
                <p>账户余额：<span className="text-green-400">{userData.points || 0} Pi</span></p>
              </div>
            </div>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => setShowRecharge(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded"
              >
                充值
              </button>
              <button
                onClick={() => setShowWithdraw(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                提现
              </button>
            </div>
          </div>

          {/* 邀请二维码与链接 */}
<div className="mb-6">
  <p className="mb-1">邀请链接：</p>
  <div className="flex items-center bg-gray-800 rounded p-2 justify-between">
    <span className="text-green-400 break-all">{inviteLink}</span>
    <button
      onClick={() => navigator.clipboard.writeText(inviteLink)}
      className="ml-4 bg-blue-600 px-2 py-1 text-sm rounded"
    >
      复制
    </button>
  </div>
  <button
    onClick={() => setShowQRCode(true)}
    className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
  >
    显示二维码
  </button>
</div>


          {/* 下级用户 */}
          <div>
            <h2 className="text-xl font-semibold mb-2">我的下级用户</h2>
            {referrals.length > 0 ? (
              <ul className="space-y-2">
                {referrals.map((user) => (
                  <li key={user.id} className="bg-gray-800 p-3 rounded">
                    {user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">暂无下级用户</p>
            )}
          </div>
        </>
      ) : (
        <p>无法获取用户信息</p>
      )}

      {/* 弹窗：充值/提现 */}
      {(showRecharge || showWithdraw) && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
          <div className="bg-white text-black rounded-lg p-6 w-[90%] max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">
              {showRecharge ? "充值Pi积分" : "申请提现"}
            </h2>
            <input
              type="number"
              placeholder="请输入金额"
              className="w-full border p-2 rounded mb-4"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() =>
                  handleTransaction(showRecharge ? "recharge" : "withdraw")
                }
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                确认
              </button>
              <button
                onClick={() => {
                  setShowRecharge(false);
                  setShowWithdraw(false);
                  setAmount("");
                }}
                className="border border-gray-500 px-4 py-2 rounded"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
{showQRCode && (
  <QRCodePopup link={inviteLink} onClose={() => setShowQRCode(false)} />
)}
