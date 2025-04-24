"use client";
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function InvitePage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setInviteCode(data.inviteCode);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const inviteUrl = inviteCode
    ? `https://yourdomain.com/register?ref=${inviteCode}`
    : "";
  const qrCodeUrl = inviteCode
    ? `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(
        inviteUrl
      )}&chs=200x200&chld=L|0`
    : "";

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">邀请好友</h1>

      {inviteCode ? (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
          <p className="text-lg mb-4">你的专属邀请链接</p >
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="w-full bg-gray-700 text-white px-3 py-2 rounded mb-4 text-center"
          />
          <button
            onClick={() => navigator.clipboard.writeText(inviteUrl)}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            复制邀请链接
          </button>

          <div className="mt-6">
            <p className="mb-2">邀请二维码</p >
            <div className="inline-block bg-white p-2 rounded">
              < img src={qrCodeUrl} alt="二维码" width={200} height={200} />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-red-400">无法获取邀请码，请检查是否已登录或已注册成功。</p >
      )}
    </div>
  );
}