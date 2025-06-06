//app/admin/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminAuthGuard from '../components/AdminAuthGuard'
import AdminHeader from '../components/AdminHeader'


export default function AdminDashboard() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)

  const handleNavigate = (path: string) => {
    router.push(path)
  }


  useEffect(() => {
    const isAuthed = localStorage.getItem('admin-auth') === 'true'
    if (!isAuthed) {
      router.push('/admin/login')
    } else {
      const storedRole = localStorage.getItem('admin-role')
      setRole(storedRole)
    }

  }, [router])

  const canView = (allowed: string[]) => {
    const currentRole = role || ''
    return currentRole === 'superadmin' || allowed.includes(currentRole)
  }
  

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 p-8">
      <AdminHeader />
        <h1 className="text-3xl font-bold mb-8 text-gray-800">后台管理首页</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {canView(['admin']) && (
            <div className="bg-white shadow-lg rounded-2xl p-6 border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">管理员功能</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleNavigate('/admin/add')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl shadow-md transition-all"
                >
                  ➕ 添加管理员
                </button>
                <button
                  onClick={() => handleNavigate('/admin/roles')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-xl shadow-md transition-all"
                >
                  ⚙️ 管理员权限配置
                </button>
              </div>
            </div>
          )}

          {canView(['admin', 'editor']) && (
            <div className="bg-white shadow-lg rounded-2xl p-6 border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">审核功能</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleNavigate('/admin/rechargeList')}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl shadow-md transition-all"
                >
                  💰 充值审核列表
                </button>
                <button
                  onClick={() => handleNavigate('/admin/withdrawList')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-xl shadow-md transition-all"
                >
                  💸 提现审核列表
                </button>
              </div>
            </div>
          )}

          {canView(['admin', 'editor', 'viewer']) && (
            <div className="bg-white shadow-lg rounded-2xl p-6 border">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">用户管理</h2>
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handleNavigate('/admin/clientList')}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl shadow-md transition-all"
                >
                  👥 客户列表与分润记录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminAuthGuard>
  )
}
