// lib/firebase-admin.ts
import admin from 'firebase-admin'


const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}

// ✅ 统一导出为 db
const db = admin.firestore()
export { db }

