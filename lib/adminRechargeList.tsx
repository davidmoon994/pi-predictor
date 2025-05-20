// adminRechargeList.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPendingTransactions, approveTransaction } from '@/lib/adminService';

type Transaction = {
  id: string;
  userId: string;
  amount: number;
  type: 'recharge' | 'withdraw';
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
};

export default function AdminRechargeList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const data = await getPendingTransactions();
    setTransactions(data);
  }

  async function handleApprove(id: string) {
    setLoading(true);
    await approveTransaction(id);
    await fetchData();
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">待审核的充值/提现申请</h2>
      {transactions.length === 0 && <p>暂无待审核项。</p>}
      <ul className="space-y-4">
        {transactions.map((tx) => (
          <li key={tx.id} className="border rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <p>
                <strong>用户：</strong> {tx.userId}
              </p>
              <p>
                <strong>类型：</strong> {tx.type === 'recharge' ? '充值' : '提现'}
              </p>
              <p>
                <strong>金额：</strong> {tx.amount}
              </p>
              <p>
                <strong>时间：</strong> {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleApprove(tx.id)}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                审核通过
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
