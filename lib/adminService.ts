// lib/adminService.ts
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  getDoc,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

// 获取所有待审核的交易记录
export async function getPendingTransactions() {
  const snapshot = await getDocs(collection(db, 'transactions'));
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(tx => tx.status === 'pending');
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
    await updateDoc(userRef, {
      points: increment(tx.amount),
    });
  } else if (tx.type === 'withdraw') {
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
