// app/userCenter/CommissionList.tsx
'use client'

import React from 'react'

// 你可以放在顶部或单独建 types 文件
type Commission = {
  id: string
  userId: string
  sourceUserId: string
  amount: number
  type: string // 例如 "一级返佣" 或 "二级返佣"
  createdAt: number | string // Firestore 存储时间戳（可能是毫秒数或 ISO 字符串）
}

type CommissionListProps = {
  commissions: Commission[]
}

const CommissionList: React.FC<CommissionListProps> = ({ commissions }) => {
  return (
    <div className="commission-list">
      <ul>
        {commissions.map((commission) => (
          <li key={commission.id}>
            来源用户：{commission.sourceUserId} | 类型：{commission.type} | 金额：{commission.amount} Pi | 时间：{new Date(commission.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CommissionList
