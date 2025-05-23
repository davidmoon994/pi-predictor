// lib/types.ts

// 用户数据结构
export type UserData = {
    uid: string;
    email?: string;
    displayName?: string;
    inviterId?: string;
    createdAt?: number;
    points?: number;
    inviteCode?: string;
    avatarUrl?: string;
  };

  // 客户信息（由当前用户邀请的用户）
export type InvitedUser = {
  uid: string;
  displayName?: string;
  email?: string;
  createdAt: number;
  level: 1 | 2; // 表示是一级客户还是二级客户
};

  
  // 分润记录
  export type Commission = {
    id: string;
    userId: string;
    sourceUserId: string;
    fromUserName?: string;
    amount: number;
    type: 'level1' | 'level2' | 'register';
    timestamp: number;
  };
  
  // 投注记录
  export type BetRecord = {
    userId: string;
    period: string;
    amount: number;
    selection: 'up' | 'down';
    result?: 'win' | 'lose' | 'draw';
    profit?: number;
    timestamp: number;
  };
  

// 钱包相关记录（充值、提现）
export type WalletTransaction = {
  id?: string;
  userId: string;
  type: 'recharge' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  platformAccountId?: string; // 平台账号（管理员处理）
  clientAccountId?: string;   // 客户账号（用户填写）
  createdAt: number;
  reviewedAt?: number;
};

// 奖池记录（每一期）
export type PoolRecord = {
  period: string;
  totalAmount: number;
  createdAt: number;
};

// 开奖结果
export type DrawResult = {
  period: string;
  closePrice: number;
  result: 'up' | 'down';
  createdAt: number;
};
