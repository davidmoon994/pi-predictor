import { db } from "./firebase";
import { getDoc } from 'firebase/firestore';
import { doc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

export async function linkReferral(newUserId: string, referrerId: string) {
  const userRef = doc(db, "users", newUserId);
  await updateDoc(userRef, {
    referrerId,
  });

  const referrerRef = doc(db, "users", referrerId);
  await updateDoc(referrerRef, {
    level1Clients: arrayUnion(newUserId),
  });

  // 添加到上级的 level2（如果存在上上级）
  const referrerSnap = await getDoc(referrerRef); // ✅ 正确写法
  const upperReferrerId = referrerSnap?.data()?.referrerId;
  if (upperReferrerId) {
    const upperRef = doc(db, "users", upperReferrerId);
    await updateDoc(upperRef, {
      level2Clients: arrayUnion(newUserId),
    });
  }
}
