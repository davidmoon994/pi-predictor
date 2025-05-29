// scripts/setAdmin.ts
import 'dotenv/config'; // 加载 .env.local 环境变量
import { getFirebaseAdminApp } from '../lib/firebase-admin';

const admin = getFirebaseAdminApp();

const targetUid = '4TfrXxW9K0a2Uo2Nak6gympyRJ12';

async function setAdmin() {
  try {
    await admin.auth().setCustomUserClaims(targetUid, { admin: true });
    console.log(`✅ UID ${targetUid} 已设置为管理员`);
  } catch (error) {
    console.error('❌ 设置管理员失败:', error);
  }
}

setAdmin();
