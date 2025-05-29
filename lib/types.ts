// 用户数据结构
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  inviteCode: string;         // 用户专属邀请码
  inviteUrl: string;          // 生成的邀请链接
  qrCodeUrl: string;          // 邀请二维码图片地址
  parentId?: string | null;   // 一级邀请人
  grandParentId?: string | null; // 二级邀请人
  createdAt: number;          // 注册时间戳
  points: number;             // 当前积分
}


// 客户信息（由当前用户邀请的用户）
export type InvitedUser = {
  uid: string;
  displayName?: string;
  email?: string;
  createdAt: number;
  level: 1 | 2;
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

// 钱包相关记录
export type WalletTransaction = {
  id?: string;
  userId: string;
  type: 'recharge' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  platformAccountId?: string;
  clientAccountId?: string;
  createdAt: number;
  reviewedAt?: number;
};

// 奖池记录
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
