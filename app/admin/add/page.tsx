// app/admin/add/page.tsx
'use client'

import { useState } from 'react'
import { auth, db } from '../../../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import AdminAuthGuard from '../components/AdminAuthGuard'
import AdminHeader from '../components/AdminHeader'
import { nanoid } from 'nanoid'

export default function AddAdminPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setInviteCode('')
    setInviteUrl('')
    setQrCodeUrl('')
    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const uid = user.uid || ''

      const newInviteCode = nanoid(8)
      const newInviteUrl = `https://yourdomain.com/register?ref=${newInviteCode}`
      const newQrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chl=${encodeURIComponent(newInviteUrl)}&chs=200x200&chld=L|0`

      const adminData = {
        email: email || '',
        role: role || 'admin',
        uid,
        inviteCode: newInviteCode,
        inviteUrl: newInviteUrl,
        qrCodeUrl: newQrCodeUrl,
        createdAt: Date.now(),
      }

      console.log('✅ 正在写入管理员数据:', adminData)

      await setDoc(doc(db, 'adminUsers', email), adminData, { merge: true })

      setMessage('✅ 管理员添加成功！')
      setInviteCode(newInviteCode)
      setInviteUrl(newInviteUrl)
      setQrCodeUrl(newQrCodeUrl)
      setEmail('')
      setPassword('')
    } catch (err: any) {
      console.error('❌ 添加失败:', err)
      setMessage('❌ 添加失败: ' + (err.message || '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <AdminHeader />
        <h1 className="text-2xl font-bold mb-6 text-gray-800">添加管理员</h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-6 max-w-md space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">管理员邮箱</label>
            <input
  type="email"
  value={email}
  onChange={(e) => {
    const input = e.target as HTMLInputElement;
    setEmail(input.value);
  }}
  required
  className="mt-1 w-full border rounded px-3 py-2"
/>


          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">初始密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">角色</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="admin">admin</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white rounded py-2 hover:bg-blue-700"
          >
            {loading ? '提交中...' : '添加管理员'}
          </button>

          {message && (
            <div className="mt-6 bg-green-50 border border-green-200 p-4 rounded text-sm text-green-800 text-center space-y-4">
              <p>{message}</p>

              {inviteCode && (
                <div className="space-y-2">
                  <p>邀请码：<strong>{inviteCode}</strong></p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteCode)
                      alert('邀请码已复制！')
                    }}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    复制邀请码
                  </button>

                  <p className="mt-4">邀请链接：</p>
                  <a href={inviteUrl} className="text-blue-600 underline break-words" target="_blank">
                    {inviteUrl}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteUrl)
                      alert('邀请链接已复制！')
                    }}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    复制邀请链接
                  </button>

                  <div className="mt-4">
                    <p>邀请二维码：</p>
                    <img
                      src={qrCodeUrl}
                      alt="邀请二维码"
                      className="mt-2 w-40 h-40 mx-auto border rounded"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(qrCodeUrl)
                        alert('二维码图片链接已复制！')
                      }}
                      className="mt-2 bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                    >
                      复制二维码图片链接
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </AdminAuthGuard>
  )
}
