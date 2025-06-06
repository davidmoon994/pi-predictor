// app/components/modals/BetModal.tsx
'use client';

import React, { useState } from 'react';
import clsx from 'clsx';

interface BetModalProps {
  type: 'up' | 'down';
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
}

const BetModal: React.FC<BetModalProps> = ({ type, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const num = parseInt(amount, 10);
    if (isNaN(num) || num <= 0) {
      setError('请输入有效的下注金额');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await onConfirm(num);
    } catch (err) {
      setError('下注失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-80 rounded-xl p-6 shadow space-y-4 text-center relative">
        <div className="text-lg font-bold text-gray-800">
          {type === 'up' ? '买涨 ↑' : '买跌 ↓'}
        </div>

        <input
          type="number"
          className={clsx(
            'w-full px-4 py-2 border rounded-lg focus:outline-none',
            type === 'up' ? 'border-green-400' : 'border-red-400'
          )}
          placeholder="请输入下注金额"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={loading}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSubmit}
            className={clsx(
              'px-4 py-2 rounded-full text-white font-semibold shadow',
              type === 'up'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            )}
            disabled={loading}
          >
            {loading ? '提交中...' : '确认下注'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            disabled={loading}
          >
            返回
          </button>
        </div>
      </div>
    </div>
  );
};

export default BetModal;
