// register/page.tsx
import { useState } from 'react';
import { registerUser } from '../lib/authService';  // 导入注册功能

const RegisterPage = () => {
  // 存储用户输入的数据
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // 提交注册表单时的处理函数
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // 防止默认表单提交行为
    try {
      // 调用注册函数
      const user = await registerUser(email, password, displayName);
      console.log('用户注册成功：', user);  // 打印注册成功的用户信息
    } catch (error) {
      console.error('注册错误：', error);  // 打印错误信息
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
      <input 
        type="text" 
        placeholder="请输入昵称" 
        value={displayName} 
        onChange={(e) => setDisplayName(e.target.value)} 
        required 
      />
      <button type="submit">注册</button>
    </form>
  );
};

export default RegisterPage;
