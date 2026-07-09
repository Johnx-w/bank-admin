/** 交易方向 */
export type TransactionDirection = 'income' | 'expense';

/** 交易状态 */
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

/** 交易记录 */
export interface Transaction {
  id: string;
  transactionNo: string;      // 交易流水号
  accountId: string;
  accountName: string;
  direction: TransactionDirection;
  amount: number;             // 单位：分（数据库存整数）
  status: TransactionStatus;
  category: string;           // 交易分类
  description: string;
  counterparty: string;       // 对方账户
  operatorId: string;         // 操作员 ID
  operatorName: string;
  auditorId?: string;         // 审核人 ID
  auditRemark?: string;       // 审核备注
  createdAt: string;
  auditedAt?: string;
}

/** 交易筛选参数 */
export interface TransactionFilter {
  status?: TransactionStatus;
  direction?: TransactionDirection;
  category?: string;
  dateRange?: [string, string];
  keyword?: string;           // 模糊搜索流水号/对方账户
}

/** 审核操作参数 */
export interface AuditAction {
  transactionIds: string[];
  action: 'approve' | 'reject';
  remark?: string;
}