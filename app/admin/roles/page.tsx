// app/admin/roles.tsx
'use client'

import { useEffect, useState } from 'react'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import AdminAuthGuard from '../components/AdminAuthGuard'
import AdminHeader from '../components/AdminHeader'

export default function AdminRolesPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const snapshot = await getDocs(collection(db, 'adminUsers'))
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAdmins(list)
    } catch (err: any) {
      setError(err.message || '获取失败')
    } finally {
      setLoading(false)
    }
  }

  const updateRole = async (id: string, newRole: string) => {
    try {
      const ref = doc(db, 'adminUsers', id)
      await updateDoc(ref, { role: newRole })
      await fetchAdmins()
    } catch (err: any) {
      alert('更新失败: ' + err.message)
    }
  }

  const deleteAdmin = async (id: string) => {
    if (!confirm(`确定要删除管理员 ${id} 吗？`)) return
    try {
      await deleteDoc(doc(db, 'adminUsers', id))
      await fetchAdmins()
    } catch (err: any) {
      alert('删除失败: ' + err.message)
    }
  }

  const currentEmail = typeof window !== 'undefined' ? localStorage.getItem('admin-email') : null

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('已复制邀请码: ' + text)
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 p-8">
        <AdminHeader />
        <h1 className="text-2xl font-bold mb-6 text-gray-800">管理员权限配置</h1>

        <div className="bg-white rounded-xl shadow-md p-6 max-w-6xl w-full overflow-x-auto">
          {loading ? (
            <p>加载中...</p>
          ) : error ? (
            <p className="text-red-600">{error}</p>
          ) : (
            <table className="w-full table-fixed text-sm text-left text-gray-700">
              <colgroup>
                <col style={{ width: '20%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </colgroup>
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="py-2 px-3">邮箱</th>
                  <th className="py-2 px-3">名称</th>
                  <th className="py-2 px-3">角色</th>
                  <th className="py-2 px-3">邀请码</th>
                  <th className="py-2 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-b hover:bg-gray-50 transition-all align-top">
                    <td className="py-2 px-3">
                      {admin.email || '-'}
                      {admin.email === currentEmail && (
                        <span className="ml-2 text-green-600 font-semibold">[当前登录]</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{admin.displayName || '-'}</td>
                    <td className="py-2 px-3">{admin.role || '未设置'}</td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      {admin.inviteCode ? (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono">{admin.inviteCode}</span>
                            <button
                              onClick={() => copyToClipboard(admin.inviteCode)}
                              className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              复制
                            </button>
                          </div>
                          {admin.qrCodeUrl && (
                            <img
                              src={admin.qrCodeUrl}
                              alt="二维码"
                              className="w-24 h-24 border rounded"
                            />
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">未生成</span>
                      )}
                    </td>
                    <td className="py-2 px-3 space-x-2 whitespace-nowrap">
                      {['admin', 'editor', 'viewer'].map((r) => (
                        <button
                          key={r}
                          onClick={() => updateRole(admin.id, r)}
                          className={`px-3 py-1 rounded shadow text-sm ${
                            r === admin.role
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                      <button
                        onClick={() => deleteAdmin(admin.id)}
                        className="ml-2 px-3 py-1 rounded shadow text-sm bg-red-500 text-white hover:bg-red-600"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminAuthGuard>
  )
}
