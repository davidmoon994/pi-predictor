//app/userCenter/WalletCard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import RechargeModal from './components/RechargeModal';
import WithdrawModal from './components/WithdrawModal';
import { getUserTransactions } from '../../lib/userService';
import dayjs from 'dayjs';

interface WalletCardProps {
  userId: string;
  points: number;
}

interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any; // 这里改成 any，因为可能是 Firebase Timestamp，也可能是对象
}

const WalletCard: React.FC<WalletCardProps> = ({ userId, points }) => {
  const [showRecharge, setShowRecharge] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    setLoading(true);
    const txs = await getUserTransactions(userId);
    setTransactions(txs as Transaction[]);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // 修改 formatTime，增加判空，兼容 Firestore Timestamp 对象和普通对象
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '未知时间';

    // Firestore Timestamp 对象通常有 toDate() 方法
    if (typeof timestamp.toDate === 'function') {
      return dayjs(timestamp.toDate()).format('YYYY-MM-DD HH:mm');
    }

    // 否则尝试用 seconds 字段转换
    if (timestamp.seconds) {
      return dayjs(new Date(timestamp.seconds * 1000)).format('YYYY-MM-DD HH:mm');
    }

    // 如果是普通日期字符串或者数字时间戳也尝试格式化
    return dayjs(timestamp).isValid() ? dayjs(timestamp).format('YYYY-MM-DD HH:mm') : '未知时间';
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-500';
      default:
        return '';
    }
  };

  return (
    <div className="postcard">
      <div className="card-header">
        <h3>我的钱包</h3>
      </div>
      <div className="card-body">
        <p><strong>用户ID：</strong> {userId}</p>
        <p><strong>当前积分：</strong> {points}</p>
        <div className="mt-4 space-x-4">
          <button className="btn-recharge" onClick={() => setShowRecharge(true)}>充值</button>
          <button className="btn-withdraw" onClick={() => setShowWithdraw(true)}>提现</button>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-bold mb-2">充值 / 提现记录</h4>
          {loading ? (
            <p>加载中...</p>
          ) : transactions.length === 0 ? (
            <p className="text-gray-500">暂无记录</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
              {transactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center border-b pb-1">
                  <div>
                    <span className="font-medium">{tx.type === 'recharge' ? '充值' : '提现'}</span>
                    <span className="ml-2">{tx.amount} PI</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={statusColor(tx.status)}>{tx.status}</span>
                    <span className="text-gray-400">{formatTime(tx.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 弹窗组件 */}
      <RechargeModal
        userId={userId}
        isOpen={showRecharge}
        onClose={() => {
          setShowRecharge(false);
          loadTransactions();
        }}
      />
      <WithdrawModal
        userId={userId}
        isOpen={showWithdraw}
        onClose={() => {
          setShowWithdraw(false);
          loadTransactions();
        }}
      />
    </div>
  );
};

export default WalletCard;
