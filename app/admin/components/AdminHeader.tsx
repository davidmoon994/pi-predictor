//app/admin/components/AdminHeader.tsx
'use client'

import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '../../../lib/firebase'

export default function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('admin-email')
    router.push('/admin/login')
  }

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white shadow mb-6 rounded-xl">
      <h1 className="text-xl font-semibold text-gray-700">后台管理</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
      >
        退出登录
      </button>
    </div>
  )
}
