// app/userCenter/InviteCard.tsx
'use client'
import React, { useEffect, useState } from 'react'
import { auth, db } from '../../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const InviteCard: React.FC = () => {
  const [inviteCode, setInviteCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        // 1. 先尝试从普通用户集合读取
        let userDocRef = doc(db, 'users', user.uid)
        let userSnap = await getDoc(userDocRef)
        if (userSnap.exists()) {
          const data = userSnap.data()
          if (data.inviteCode) {
            setInviteCode(data.inviteCode)
            setLoading(false)
            return
          }
        }

        // 2. 普通用户没找到邀请码，再试管理员集合（用邮箱作为文档ID）
        if (user.email) {
          userDocRef = doc(db, 'adminUsers', user.email)
          userSnap = await getDoc(userDocRef)
          if (userSnap.exists()) {
            const data = userSnap.data()
            if (data.inviteCode) {
              setInviteCode(data.inviteCode)
              setLoading(false)
              return
            }
          }
        }

        // 3. 都没找到邀请码
        setInviteCode(null)
      } else {
        setInviteCode(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const inviteUrl = inviteCode
    ? `https://yourdomain.com/register?ref=${inviteCode}`
    : ''

  const qrCodeUrl = inviteCode
    ? `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(inviteUrl)}&chs=200x200`
    : ''

  if (loading) {
    return <p>加载中...</p>
  }

  return (
    <div className="postcard border rounded p-4 max-w-md mx-auto bg-white shadow">
      <h3 className="text-lg font-semibold mb-4 text-center">邀请好友</h3>
      {inviteCode ? (
        <>
          <p className="text-center mb-2">你的专属邀请码：</p>
          <div className="text-center mb-4">
            <code className="bg-gray-100 px-3 py-1 rounded font-mono text-xl">{inviteCode}</code>
          </div>

          <p className="text-center mb-2">邀请链接：</p>
          <input
            type="text"
            readOnly
            value={inviteUrl}
            className="w-full bg-gray-100 rounded px-3 py-2 mb-3 text-center"
          />
          <div className="flex justify-center space-x-3 mb-4">
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteCode)
                alert('邀请码已复制！')
              }}
              className="btn-copy bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              复制邀请码
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(inviteUrl)
                alert('邀请链接已复制！')
              }}
              className="btn-copy bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
            >
              复制邀请链接
            </button>
          </div>

          <div className="text-center">
            <p className="mb-2">邀请二维码：</p>
            <img
              src={qrCodeUrl}
              alt="邀请二维码"
              width={200}
              height={200}
              className="mx-auto border rounded"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(qrCodeUrl)
                alert('二维码图片链接已复制！')
              }}
              className="mt-2 btn-copy bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
            >
              复制二维码链接
            </button>
          </div>
        </>
      ) : (
        <p className="text-red-600 text-center">无法获取邀请码，请确认是否已登录</p>
      )}
    </div>
  )
}

export default InviteCard
