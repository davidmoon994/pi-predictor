'use client'

import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // 获取对应的管理员数据
      const ref = doc(db, 'adminUsers', email)
      const snap = await getDoc(ref)

      if (!snap.exists()) {
        setError('该用户不是管理员，请联系超级管理员审批。')
        setLoading(false)
        return
      }

      const data = snap.data()
      if (!data.role) {
        setError('您的管理员权限尚未配置，请等待审批。')
        setLoading(false)
        return
      }

      // 登录成功，保存本地
localStorage.setItem('admin-email', email)
router.push('/admin/dashboard') // ✅ 跳转到后台主页

    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">管理员登录</h1>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin}>
          <label className="block mb-3">
            <span className="text-gray-700">邮箱</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              required
            />
          </label>

          <label className="block mb-6">
            <span className="text-gray-700">密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded shadow"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
