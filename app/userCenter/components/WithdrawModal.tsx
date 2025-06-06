//app/userCenter/components/WithdrawModal.tsx
'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import { requestTransaction } from '../../../lib/userService';

export default function WithdrawModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}) {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleWithdraw = async () => {
    if (!accountId.trim()) return setMessage('请输入您的账户 ID');
    if (amount <= 0) return setMessage('请输入大于 0 的金额');
    setLoading(true);
    try {
      await requestTransaction(userId, amount, 'withdraw',accountId);
      setMessage(`提现申请已提交，等待管理员审核`);
      setAmount(0);
      setAccountId('');
      onSuccess?.();
    } catch {
      setMessage('提现申请失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundImage: `
          url(/page.jpg), url(/page.jpg),
          url(/page.jpg), url(/page.jpg)
        `,
        backgroundPosition: 'top left, top right, bottom left, bottom right',
        backgroundSize: '50% 50%',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      <div className="bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-gray-300 max-w-sm w-full relative">
        <h2 className="text-xl font-bold mb-4 text-center">提现 Pi</h2>

        <div className="mb-3">
          <label className="text-sm text-gray-700">平台账户 ID：</label>
          <p className="text-base font-semibold text-gray-900">123456789025</p>
        </div>

        <input
          type="text"
          placeholder="请输入您的账户 ID"
          className="w-full p-3 rounded-lg border border-gray-300 mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
        />

        <input
          type="number"
          placeholder="请输入要提现的 PI 数量"
          className="w-full p-3 rounded-lg border border-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-red-400"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 underline"
          >
            取消
          </button>
          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            {loading ? '提交中...' : '确认提现'}
          </button>
        </div>

        {message && (
          <p className="text-center text-sm text-gray-700 mt-3">{message}</p>
        )}
      </div>
    </div>
  );
}
