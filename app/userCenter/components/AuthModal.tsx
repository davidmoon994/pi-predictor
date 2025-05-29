import React, { useState } from 'react';

const AuthModal = ({ onSubmit, title = '注册/登录' }: { onSubmit: (email: string, password: string, displayName: string) => void, title?: string }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password, displayName);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>{title}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="请输入邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="text"
            placeholder="请输入昵称"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>提交</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '300px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '20px',
    fontSize: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '14px',
    color: '#000', // 黑色字体
    backgroundColor: '#fff', // 白色背景
  },
  button: {
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
  },
};

export default AuthModal;
