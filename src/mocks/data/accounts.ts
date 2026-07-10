/**
 * 账户管理模块 Mock 数据
 *
 * 用于账户管理页面的列表展示和详情查看。
 * 覆盖所有 AccountStatus 和 AccountType 组合。
 * 可扩展点：追加账户条目或余额变动记录。
 */

/** 余额变动记录 */
export interface BalanceRecord {
  id: string;
  date: string;
  type: "income" | "expense";
  amount: number;
  balanceAfter: number;
  description: string;
}

/** Mock 账户数据（扩展类型） */
export interface MockAccount {
  id: string;
  accountNo: string;
  holderName: string;
  holderId: string;
  type: "savings" | "checking" | "credit";
  currency: string;
  balance: number;
  status: "active" | "frozen" | "closed";
  openDate: string;
  freezeReason?: string;
  createdAt: string;
  updatedAt: string;
  /** 余额变动记录（仅通过详情接口返回） */
  balanceRecords: BalanceRecord[];
}

/** Mock 账户列表 */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: "acc001",
    accountNo: "6222021234567890123",
    holderName: "张三",
    holderId: "u004",
    type: "savings",
    currency: "CNY",
    balance: 15280000,
    status: "active",
    openDate: "2025-01-15",
    createdAt: "2025-01-15T00:00:00",
    updatedAt: "2026-07-09T00:00:00",
    balanceRecords: [
      { id: "br001", date: "2026-07-09", type: "income", amount: 150000, balanceAfter: 15280000, description: "跨行转账收入" },
      { id: "br002", date: "2026-07-08", type: "expense", amount: 30000, balanceAfter: 15130000, description: "日常消费支出" },
      { id: "br003", date: "2026-07-01", type: "income", amount: 500000, balanceAfter: 15160000, description: "工资入账" },
    ],
  },
  {
    id: "acc002",
    accountNo: "6222029876543210987",
    holderName: "李四",
    holderId: "u005",
    type: "checking",
    currency: "CNY",
    balance: 42500000,
    status: "active",
    openDate: "2025-03-20",
    createdAt: "2025-03-20T00:00:00",
    updatedAt: "2026-07-09T00:00:00",
    balanceRecords: [
      { id: "br004", date: "2026-07-09", type: "expense", amount: 500000, balanceAfter: 42500000, description: "大额采购支出" },
      { id: "br005", date: "2026-07-06", type: "income", amount: 350000, balanceAfter: 43000000, description: "消费退款" },
      { id: "br006", date: "2026-06-30", type: "income", amount: 10000000, balanceAfter: 42650000, description: "季度结息" },
    ],
  },
  {
    id: "acc003",
    accountNo: "6214830123456789012",
    holderName: "王五",
    holderId: "u006",
    type: "savings",
    currency: "CNY",
    balance: 89000000,
    status: "active",
    openDate: "2024-08-10",
    createdAt: "2024-08-10T00:00:00",
    updatedAt: "2026-07-09T00:00:00",
    balanceRecords: [
      { id: "br007", date: "2026-07-09", type: "income", amount: 2500000, balanceAfter: 89000000, description: "转账收入（已驳回）" },
      { id: "br008", date: "2026-07-07", type: "expense", amount: 450000, balanceAfter: 86500000, description: "跨行转账支出" },
      { id: "br009", date: "2026-06-25", type: "income", amount: 5000000, balanceAfter: 86950000, description: "理财到期赎回" },
    ],
  },
  {
    id: "acc004",
    accountNo: "6217995566778899001",
    holderName: "赵六",
    holderId: "u007",
    type: "credit",
    currency: "CNY",
    balance: -2500000,
    status: "active",
    openDate: "2025-06-01",
    createdAt: "2025-06-01T00:00:00",
    updatedAt: "2026-07-09T00:00:00",
    balanceRecords: [
      { id: "br010", date: "2026-07-08", type: "income", amount: 800000, balanceAfter: -2500000, description: "柜台充值" },
      { id: "br011", date: "2026-07-05", type: "income", amount: 10000000, balanceAfter: -3300000, description: "企业账户入账" },
      { id: "br012", date: "2026-06-20", type: "expense", amount: 1500000, balanceAfter: -13300000, description: "信用卡消费" },
    ],
  },
  {
    id: "acc005",
    accountNo: "6228480011223344556",
    holderName: "孙七",
    holderId: "u008",
    type: "savings",
    currency: "CNY",
    balance: 0,
    status: "frozen",
    openDate: "2024-12-01",
    freezeReason: "涉嫌异常交易，账户已冻结",
    createdAt: "2024-12-01T00:00:00",
    updatedAt: "2026-07-08T00:00:00",
    balanceRecords: [
      { id: "br013", date: "2026-07-07", type: "expense", amount: 1200000, balanceAfter: 0, description: "大额提现（已取消）" },
      { id: "br014", date: "2026-07-05", type: "income", amount: 50000, balanceAfter: 1200000, description: "手机银行充值" },
    ],
  },
  {
    id: "acc006",
    accountNo: "6212260099887766554",
    holderName: "周八",
    holderId: "u009",
    type: "checking",
    currency: "CNY",
    balance: 0,
    status: "closed",
    openDate: "2024-03-15",
    createdAt: "2024-03-15T00:00:00",
    updatedAt: "2026-06-30T00:00:00",
    balanceRecords: [],
  },
  {
    id: "acc007",
    accountNo: "6217001122334455667",
    holderName: "吴九",
    holderId: "u010",
    type: "savings",
    currency: "USD",
    balance: 50000000,
    status: "active",
    openDate: "2025-09-10",
    createdAt: "2025-09-10T00:00:00",
    updatedAt: "2026-07-09T00:00:00",
    balanceRecords: [
      { id: "br015", date: "2026-07-01", type: "income", amount: 50000000, balanceAfter: 50000000, description: "外汇入账" },
    ],
  },
  {
    id: "acc008",
    accountNo: "6230580011223344558",
    holderName: "郑十",
    holderId: "u011",
    type: "savings",
    currency: "CNY",
    balance: 3200000,
    status: "active",
    openDate: "2026-01-05",
    createdAt: "2026-01-05T00:00:00",
    updatedAt: "2026-07-09T00:00:00",
    balanceRecords: [
      { id: "br016", date: "2026-07-03", type: "income", amount: 1000000, balanceAfter: 3200000, description: "转账入账" },
      { id: "br017", date: "2026-06-15", type: "income", amount: 2200000, balanceAfter: 2200000, description: "开户存入" },
    ],
  },
];
