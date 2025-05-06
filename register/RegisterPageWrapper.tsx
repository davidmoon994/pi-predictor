"use client";
import React, { Suspense } from "react";
import RegisterPage from "./page"; // 引入 RegisterPage 组件

export default function RegisterPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPage />
    </Suspense>
  );
}
