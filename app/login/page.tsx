// login/page.tsx
'use client';
import { useState } from 'react';
import { registerUser } from '../../lib/authService';  // 导入登录功能

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await registerUser(email, password, undefined, undefined);

      console.log('用户登录成功：', user);
    } catch (error) {
      console.error('登录错误：', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        placeholder="请输入邮箱" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        required 
      />
      <input 
        type="password" 
        placeholder="请输入密码" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        required 
      />
      <button type="submit">登录</button>
    </form>
  );
};

export default LoginPage;
