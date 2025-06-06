// lib/adminService.ts
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  getDoc,
  increment,
  query,
  where,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

export interface TransactionRecord {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  accountId?: string; // ← 添加这个字段
}

// 辅助函数：将 Firestore doc 转为 TransactionRecord
function toTransactionRecord(doc: QueryDocumentSnapshot<DocumentData>): TransactionRecord {
  const data = doc.data();
  let createdAtNum: number;

  if (data.createdAt?.toMillis) {
    createdAtNum = data.createdAt.toMillis();
  } else if (typeof data.createdAt === 'number') {
    createdAtNum = data.createdAt;
  } else {
    createdAtNum = Date.now();
  }

  return {
    id: doc.id,
    userId: data.userId,
    amount: data.amount,
    status: data.status,
    createdAt: createdAtNum,
    accountId: data.accountId,
  };
}

// 获取所有待审核的交易记录（包含充值和提现）
export async function getPendingTransactions(): Promise<TransactionRecord[]> {
  const snapshot = await getDocs(collection(db, 'transactions'));
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...(doc.data() as Omit<TransactionRecord, 'id'>) }))
    .filter(tx => tx.status === 'pending');
}

// 获取所有待审核的提现申请
export async function getPendingWithdrawals(): Promise<TransactionRecord[]> {
  const q = query(
    collection(db, 'transactions'),
    where('type', '==', 'withdraw'),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return snap.docs.map(toTransactionRecord);
}

// 获取所有待审核的充值申请
export async function getPendingRecharges(): Promise<TransactionRecord[]> {
  const q = query(
    collection(db, 'transactions'),
    where('type', '==', 'recharge'),
    where('status', '==', 'pending')
  );
  const snap = await getDocs(q);
  return snap.docs.map(toTransactionRecord);
}

// 审核通过：更新交易状态 & 修改用户积分
export async function approveTransaction(txId: string) {
  const txRef = doc(db, 'transactions', txId);
  const txSnap = await getDoc(txRef);
  if (!txSnap.exists()) return;

  const tx = txSnap.data();
  const userRef = doc(db, 'users', tx.userId);

  if (tx.status !== 'pending') return; // 避免重复审核

  if (tx.type === 'recharge') {
    // 充值审核通过，加积分
    await updateDoc(userRef, {
      points: increment(tx.amount),
    });
  } else if (tx.type === 'withdraw') {
    // 提现审核通过，扣积分
    await updateDoc(userRef, {
      points: increment(-tx.amount),
    });
  }

  await updateDoc(txRef, {
    status: 'approved',
    processedAt: Date.now(),
  });
}

// 拒绝交易申请
export async function rejectTransaction(txId: string) {
  const txRef = doc(db, 'transactions', txId);
  await updateDoc(txRef, {
    status: 'rejected',
    processedAt: Date.now(),
  });
}

// 提现审核通过
export async function approveWithdrawal(id: string) {
  await approveTransaction(id);
}

// 拒绝提现申请
export async function rejectWithdrawal(id: string) {
  await rejectTransaction(id);
}

export async function getRechargesByStatus(
  status: 'pending' | 'approved' | 'rejected'
): Promise<TransactionRecord[]> {
  const q = query(
    collection(db, 'transactions'),
    where('type', '==', 'recharge'),
    where('status', '==', status)
  );
  const snap = await getDocs(q);
  return snap.docs.map(toTransactionRecord);
}

// 根据状态查询提现记录
export async function getWithdrawalsByStatus(
  status: 'pending' | 'approved' | 'rejected'
): Promise<TransactionRecord[]> {
  const q = query(
    collection(db, 'transactions'),
    where('type', '==', 'withdraw'),
    where('status', '==', status)
  );
  const snap = await getDocs(q);
  return snap.docs.map(toTransactionRecord);
}
