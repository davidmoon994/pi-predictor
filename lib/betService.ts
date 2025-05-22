// lib/betService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  increment,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { updatePoolAfterBet } from "./poolService";

export async function placeBet(
  userId: string,
  period: string,
  direction: "up" | "down",
  amount: number,
  invitedBy?: string
) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.exists() ? userSnap.data() : null;

if (!userData || userData.points < amount) {
  throw new Error("用户不存在或积分不足");
}


  // 扣除积分
  await updateDoc(userRef, {
    points: userData.points - amount,
  });

  // 更新奖池
  await updatePoolAfterBet(period, direction, amount);


  // 写入下注记录
  await addDoc(collection(db, "bets"), {
    userId,
    periodId: period,
    direction,
    amount,
    timestamp: Date.now(),
    invitedBy: invitedBy || userData.invitedBy || null,
  });

  // 一级邀请人返佣
  const inviterCode = invitedBy || userData.invitedBy;
  if (inviterCode) {
    const ref1Snap = await getDocs(query(collection(db, "users"), where("inviteCode", "==", inviterCode)));
    if (!ref1Snap.empty) {
      const ref1Doc = ref1Snap.docs[0];
      const ref1Id = ref1Doc.id;
      const ref1Data = ref1Doc.data();

      const reward1 = Math.floor(amount * 0.02);
      await updateDoc(doc(db, "users", ref1Id), { points: increment(reward1) });
      await addDoc(collection(db, "commissions"), {
        userId: ref1Id,
        fromUser: userId,
        amount: reward1,
        periodId: period,
        level: 1,
        type: "一级返佣",
        timestamp: Date.now(),
      });

      // 二级返佣
      if (ref1Data.invitedBy) {
        const ref2Snap = await getDocs(query(collection(db, "users"), where("inviteCode", "==", ref1Data.invitedBy)));
        if (!ref2Snap.empty) {
          const ref2Doc = ref2Snap.docs[0];
          const ref2Id = ref2Doc.id;
          const reward2 = Math.floor(amount * 0.01);
          await updateDoc(doc(db, "users", ref2Id), { points: increment(reward2) });
          await addDoc(collection(db, "commissions"), {
            userId: ref2Id,
            fromUser: userId,
            amount: reward2,
            periodId: period,
            level: 2,
            type: "二级返佣",
            timestamp: Date.now(),
          });
        }
      }
    }
  }
}
