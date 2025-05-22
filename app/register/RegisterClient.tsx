//app/register/RegisterClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { registerUser } from '../../lib/authService';
import './RegisterPage.css';

const RegisterClient = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviterId, setInviterId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const inviter = searchParams.get('inviter');
    if (inviter) setInviterId(inviter);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致，请重新输入');
      return;
    }

    try {
      const user = await registerUser(email, password, displayName, inviterId || undefined);
      alert('注册成功！');
      router.push('/');
    } catch (error: any) {
      console.error('注册错误：', error.message || error);
      alert(error.message || '注册失败');
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>注册新账号</h2>

        <label className="input-label">你的邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-field"
        />

        <label className="input-label">登录密码</label>
        <div className="input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <span className="toggle-visibility" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <label className="input-label">确认密码</label>
        <div className="input-wrapper">
          <input
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="input-field"
          />
          <span className="toggle-visibility" onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? '🙈' : '👁️'}
          </span>
        </div>

        <label className="input-label">你的账户ID</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="input-field"
        />

        {inviterId && <p className="inviter-id">邀请人 ID: {inviterId}</p>}

        <button type="submit" className="submit-btn">注册</button>
      </form>
    </div>
  );
};

export default RegisterClient;

