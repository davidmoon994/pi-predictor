//app/register/RegisterPageWrapper.tsx
'use client';
import React, { Suspense } from 'react';
import RegisterClient from './RegisterClient'; // 下一步我们创建这个文件

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterClient />
    </Suspense>
  );
}
