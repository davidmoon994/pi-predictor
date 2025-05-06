// lib/firebase-admin.ts
import admin from 'firebase-admin'
import serviceAccount from './serviceAccountKey.json'

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  })
}

// ✅ 统一导出为 db
const db = admin.firestore()
export { db }

