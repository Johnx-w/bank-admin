/** 账户状态 */
export type AccountStatus = 'active' | 'frozen' | 'closed';

/** 账户类型 */
export type AccountType = 'savings' | 'checking' | 'credit';

/** 账户实体 */
export interface Account {
  id: string;
  accountNo: string;          // 账号
  holderName: string;         // 持有人
  holderId: string;           // 持有人用户 ID
  type: AccountType;
  currency: string;           // 币种，如 CNY / USD
  balance: number;            // 余额，单位：分
  status: AccountStatus;
  openDate: string;
  freezeReason?: string;
  createdAt: string;
  updatedAt: string;
}

/** 开户表单数据 */
export interface AccountFormData {
  holderName: string;
  holderId: string;
  type: AccountType;
  currency: string;
  initialDeposit: number;     // 初始存入金额，单位：分
}