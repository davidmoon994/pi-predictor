// app/admin/components/AdminAuthGuard.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../../lib/firebase'
import { doc, getDoc } from 'firebase/firestore'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        // 检查 Firestore 中是否存在管理员记录
        const adminRef = doc(db, 'adminUsers', user.email)
        const snap = await getDoc(adminRef)

        if (snap.exists()) {
          localStorage.setItem('admin-email', user.email)
          setAuthorized(true)
        } else {
          alert('无权限访问该页面')
          router.push('/admin/login')
        }
      } else {
        router.push('/admin/login')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-gray-600">
        正在验证权限...
      </div>
    )
  }

  return authorized ? <>{children}</> : null
}
