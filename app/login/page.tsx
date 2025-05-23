//app/login/page.tsx
'use client';

import { useState } from 'react';
import { signInUser } from '@lib/authService';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@lib/firebase'; // 确保你导出的是 firebase 初始化的 auth
import { useRouter } from 'next/navigation';
import './LoginPage.css'; // 如果你有 CSS，可引入

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await signInUser(email, password);
      console.log('登录成功', user);
      router.push('/'); // 登录成功跳转首页
    } catch (error: any) {
      setErrorMessage(error.message || '登录失败，请重试');
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('密码重置邮件已发送，请查收邮箱。');
    } catch (error: any) {
      setResetMessage(error.message || '发送失败，请检查邮箱是否正确');
    }
  };

  return (
    <div className="login-container bg-cover bg-center min-h-screen flex items-center justify-center" style={{ backgroundImage: "url('/register.jpg')" }}>
      <form onSubmit={handleLogin} className="login-form bg-white bg-opacity-90 p-8 rounded-xl shadow-xl max-w-sm w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">用户登录</h2>

        <input
          type="email"
          placeholder="请输入邮箱"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

        <button type="submit" className="submit-btn mt-4 w-full">登录</button>

        <div className="text-sm text-right mt-3 text-blue-500 cursor-pointer hover:underline" onClick={() => setShowResetModal(true)}>
          忘记密码？
        </div>
      </form>

      {/* 密码重置弹窗 */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80">
            <h3 className="text-lg font-bold mb-4 text-gray-800">找回密码</h3>
            <input
              type="email"
              placeholder="请输入注册邮箱"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="input-field mb-3"
            />
            {resetMessage && <p className="text-sm text-green-600">{resetMessage}</p>}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-1 bg-gray-300 rounded hover:bg-gray-400 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                发送邮件
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
