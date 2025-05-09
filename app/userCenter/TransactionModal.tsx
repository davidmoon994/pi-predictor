// app/userCenter/TransactionModal.tsx
import { useState } from 'react';
import { processTransaction } from '../../lib/userService';

type TransactionModalProps = {
  type: 'recharge' | 'withdraw';
  onClose: () => void;
  user: { uid: string };
};


const TransactionModal = ({ type, onClose, user }: TransactionModalProps) => {
  const [amount, setAmount] = useState(0);
  const [transactionId, setTransactionId] = useState('');

  const handleTransaction = async () => {
    try {
      await processTransaction(user.uid, amount, type);
      alert(`${type === 'recharge' ? '充值' : '提现'}成功！`);
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`${type === 'recharge' ? '充值' : '提现'}失败，错误：${errorMessage}`);
    }
  }    

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>{type === 'recharge' ? '充值' : '提现'}</h2>
        <input 
          type="text" 
          placeholder="请输入金额" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))} 
        />
        <input 
          type="text" 
          placeholder="请输入交易ID" 
          value={transactionId} 
          onChange={(e) => setTransactionId(e.target.value)} 
        />
        <button onClick={handleTransaction}>{type === 'recharge' ? '充值' : '提现'}</button>
        <button onClick={onClose}>关闭</button>
      </div>
    </div>
  );
}

export default TransactionModal;
