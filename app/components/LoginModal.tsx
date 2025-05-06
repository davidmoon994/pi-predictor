// app/components/LoginModal.tsx
import React, { useState } from 'react';

const LoginModal = ({ closeModal }: { closeModal: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 处理登录逻辑
    console.log('登录', { username, password });
    closeModal(); // 登录成功后关闭窗口
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <button onClick={closeModal} className="close-btn">X</button>
        <h2>登录</h2>
        <input 
          type="text" 
          placeholder="用户名" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="密码" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button onClick={handleLogin}>登录</button>
      </div>
    </div>
  );
};

export default LoginModal;
