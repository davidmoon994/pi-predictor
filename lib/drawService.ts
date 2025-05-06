import { db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  getDoc,
} from "firebase/firestore";

// 获取某一期的投注记录
async function getBetsByPeriod(periodId: string) {
  const betQuery = query(collection(db, "bets"), where("periodId", "==", periodId));
  const betSnap = await getDocs(betQuery);
  return betSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// 更新用户积分
async function updateUserPoints(userId: string, delta: number) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const currentPoints = userSnap.data().points || 0;
  await updateDoc(userRef, {
    points: currentPoints + delta,
  });
}

// 分润逻辑
async function applyReferralBonus(userId: string, amount: number) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return;

  const { invitedBy } = userSnap.data();
  if (!invitedBy) return;

  const firstRef = invitedBy;
  const firstRefRef = query(collection(db, "users"), where("inviteCode", "==", firstRef));
  const firstRefSnap = await getDocs(firstRefRef);
  if (!firstRefSnap.empty) {
    const firstRefUser = firstRefSnap.docs[0];
    await updateUserPoints(firstRefUser.id, Math.floor(amount * 0.02));
  }

  // 二级推荐�?
  const secondRef = firstRefSnap.docs[0].data().invitedBy;
  if (secondRef) {
    const secondRefRef = query(collection(db, "users"), where("inviteCode", "==", secondRef));
    const secondRefSnap = await getDocs(secondRefRef);
    if (!secondRefSnap.empty) {
      const secondRefUser = secondRefSnap.docs[0];
      await updateUserPoints(secondRefUser.id, Math.floor(amount * 0.01));
    }
  }
}

// 开奖核心逻辑
export async function drawAndSettle(periodId: string, openPrice: number, closePrice: number) {
  const allBets = await getBetsByPeriod(periodId);
  if (allBets.length === 0) return;

  const result = closePrice > openPrice ? "up" : "down";

  const totalPool = allBets.reduce((sum, b) => sum + b.amount, 0);
  const destroyed = Math.floor(totalPool * 0.06);
  const rewardPool = totalPool - destroyed;

  const winners = allBets.filter((b) => b.direction === result);
  const totalWinAmount = winners.reduce((sum, b) => sum + b.amount, 0);

  // 按比例发放奖�?
  for (const bet of winners) {
    const reward = Math.floor((bet.amount / totalWinAmount) * rewardPool);
    await updateUserPoints(bet.userId, reward);
  }

  // 所有下注分�?
  for (const bet of allBets) {
    await applyReferralBonus(bet.userId, bet.amount);
  }

  // 写入开奖记�?
  await addDoc(collection(db, "draws"), {
    periodId,
    result,
    openPrice,
    closePrice,
    totalPool,
    rewardPool,
    destroyed,
    timestamp: Date.now(),
  });
}
