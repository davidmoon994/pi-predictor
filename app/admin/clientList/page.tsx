// app/admin/clientList/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { getClientHierarchyWithDetails } from '../../../lib/userService'
import type { UserData } from '../../../lib/types'

type ClientDetail = {
  id: string
  points: number
  level1Clients: Array<{ id: string; totalBets: number; totalCommissions: number }>
  level2Clients: Array<{ id: string; totalBets: number; totalCommissions: number }>
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientDetail[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: 这里改成动态管理员 UID，比如从 authContext 或 props
  const adminUid = '管理员的UID示例'

  useEffect(() => {
    setLoading(true)
    setError(null)
    getClientHierarchyWithDetails(adminUid)
      .then(data => {
        setClients(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('加载客户数据失败')
        setLoading(false)
      })
  }, [adminUid])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">客户管理</h1>

      {loading && <p>加载中...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && clients.length === 0 && <p>暂无客户数据</p>}

      {!loading &&
        !error &&
        clients.map(client => (
          <div key={client.id} className="mb-8 border p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-1">用户 ID: {client.id}</h2>
            <p>积分: {client.points}</p>

            <h3 className="font-bold mt-4 mb-2">一级客户:</h3>
            {client.level1Clients.length === 0 ? (
              <p className="ml-4 text-gray-500">无一级客户</p>
            ) : (
              <ul className="ml-4 list-disc">
                {client.level1Clients.map(c => (
                  <li key={c.id}>
                    ID: {c.id}, 下注总额: {c.totalBets}, 分润总额: {c.totalCommissions}
                  </li>
                ))}
              </ul>
            )}

            <h3 className="font-bold mt-4 mb-2">二级客户:</h3>
            {client.level2Clients.length === 0 ? (
              <p className="ml-4 text-gray-500">无二级客户</p>
            ) : (
              <ul className="ml-4 list-disc">
                {client.level2Clients.map(c => (
                  <li key={c.id}>
                    ID: {c.id}, 下注总额: {c.totalBets}, 分润总额: {c.totalCommissions}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </div>
  )
}

