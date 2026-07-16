# 💰 银行后台管理系统 (Bank Admin)

基于 React 19 + Ant Design 6 + TypeScript 的银行后台管理系统，涵盖用户管理、交易审核、账户管理、角色权限、数据概览等核心模块。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 19、TypeScript 6 |
| UI 组件 | Ant Design 6、@ant-design/icons |
| 路由 | React Router 7 |
| 状态管理 | Zustand 5 |
| HTTP 客户端 | Axios |
| 图表 | ECharts 6、echarts-for-react |
| 工具库 | dayjs、xlsx |
| Mock 服务 | MSW 2（Mock Service Worker） |
| 构建 | Vite 8 |
| 测试 | Vitest 4、Testing Library、Playwright |
| 代码检查 | oxlint |

## 功能模块

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 数据概览 | 统计卡片、自动待办（待审核/异常告警）、自定义待办 CRUD |
| `/users` | 用户管理 | 用户列表、搜索筛选、新增/编辑用户 |
| `/roles` | 角色权限 | 角色列表、权限分配 |
| `/transactions` | 交易管理 | 交易列表、多条件筛选、详情查看、审核通过/驳回 |
| `/accounts` | 账户管理 | 账户列表、状态管理（冻结/销户） |
| `/settings/logs` | 操作日志 | 系统操作日志查看 |
| `/settings/config` | 系统配置 | 系统参数配置 |
| `/reports` | 报表中心 | 数据报表展示与导出 |
| `/completed-todos` | 已完成待办 | 已完成待办查看、取消完成、删除 |
| `/profile` | 个人中心 | 个人信息管理 |
| `/login` | 登录 | 用户登录认证 |

### 待办事项功能

- **自动待办**：待审核交易及金额 ≥ ¥5,000 的大额异常交易实时监控，审核后动态更新、归零自动消失
- **自定义待办**：支持创建、标记完成、设置紧急程度（高/中/低）和截止时间
- **已完成待办**：侧边栏 Badge 增量计数，进入页面后清零
- **智能日期**：截止日期按距离自动显示"今天/明天/本周X/日期"

## 快速开始

### 环境要求

- Node.js ≥ 22
- npm ≥ 9

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（MSW Mock 模式，无需后端）
npm run dev

# 浏览器访问 http://localhost:5173
```

### 登录凭据

开发模式下 MSW 拦截所有 API 请求，使用以下账号登录：

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 超级管理员 | `admin` | `admin123` |

## 可用命令

```bash
npm run dev          # 启动 Vite 开发服务器
npm run build        # TypeScript 类型检查 + 生产构建
npm run preview      # 预览生产构建
npm run lint         # oxlint 代码检查
npm test             # 运行 Vitest 单元测试
npm run test:watch   # 监听模式运行测试
```

## 项目结构

```
bank-admin/
├── e2e/                    # Playwright E2E 测试
│   ├── login.spec.ts
│   ├── users.spec.ts
│   └── playwright.config.ts
├── public/
│   └── mockServiceWorker.js  # MSW Service Worker
├── src/
│   ├── api/                  # API 请求函数（Axios 封装）
│   │   ├── client.ts         # Axios 实例 + 拦截器
│   │   ├── accounts.ts
│   │   ├── dashboard.ts
│   │   ├── roles.ts
│   │   ├── system.ts
│   │   ├── todos.ts
│   │   ├── transactions.ts
│   │   └── users.ts
│   ├── components/           # 公共组件
│   │   ├── ConfirmModal/     # 二次确认弹窗
│   │   ├── EmptyState/       # 空状态占位
│   │   ├── ErrorBoundary/    # 错误边界
│   │   ├── PageLoading/      # 页面加载态
│   │   ├── PermissionBtn/    # 权限控制按钮
│   │   ├── ProForm/          # 表单组件
│   │   ├── ProTable/         # 表格组件
│   │   ├── SearchForm/       # 搜索表单
│   │   └── StatCard/         # 统计卡片
│   ├── hooks/                # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── usePagination.ts
│   │   └── usePermission.ts
│   ├── layouts/              # 布局组件
│   │   ├── AdminLayout/      # 管理后台布局
│   │   │   ├── Header.tsx    # 顶栏（折叠按钮、用户信息）
│   │   │   ├── Sidebar.tsx   # 侧边栏菜单
│   │   │   ├── TabsView.tsx  # 多标签页导航
│   │   │   └── index.tsx     # 布局容器
│   │   └── AuthLayout/       # 登录页布局
│   ├── mocks/                # MSW Mock 数据与请求处理器
│   │   ├── browser.ts        # 浏览器端 MSW 初始化
│   │   ├── data/             # Mock 数据
│   │   └── handlers/         # 请求处理器
│   ├── pages/                # 页面组件（每个文件夹一个页面）
│   │   ├── Accounts/
│   │   ├── CompletedTodos/
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── NotFound.tsx
│   │   ├── Profile/
│   │   ├── Reports/
│   │   ├── Roles/
│   │   ├── Settings/
│   │   ├── Transactions/
│   │   └── Users/
│   ├── stores/               # Zustand 状态管理
│   │   ├── appStore.ts       # 全局 UI 状态（侧边栏、主题）
│   │   ├── authStore.ts      # 认证状态
│   │   ├── permissionStore.ts # 权限状态
│   │   └── todoStore.ts      # 待办事项状态
│   ├── styles/               # 全局样式
│   │   ├── index.css         # 布局与响应式样式
│   │   └── theme.ts          # Ant Design 主题配置
│   ├── types/                # TypeScript 类型定义
│   │   ├── account.ts
│   │   ├── api.ts            # 通用 API 响应类型
│   │   ├── common.ts
│   │   ├── dashboard.ts
│   │   ├── role.ts
│   │   ├── system.ts
│   │   ├── todo.ts
│   │   ├── transaction.ts
│   │   └── user.ts
│   ├── utils/                # 工具函数
│   │   ├── constants.ts      # 全局常量（枚举、配置）
│   │   ├── format.ts         # 格式化函数（日期、金额、脱敏）
│   │   ├── permission.ts     # 权限计算
│   │   └── validate.ts       # 表单校验规则
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx            # 路由配置
├── Dockerfile                 # 开发环境 Docker 配置
├── Dockerfile.prod            # 生产环境 Docker（多阶段构建）
├── docker-compose.yml
├── nginx.conf                 # Nginx SPA 路由配置
├── vite.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

## 架构说明

### 数据流

```
用户操作 → 页面组件 → API 函数 → MSW 拦截 → Mock 数据 → 响应
                   ↕
              Zustand Store（全局状态）
```

### MSW Mock 模式

项目内置完整的 Mock 数据，开发时无需后端。MSW 在浏览器 Service Worker 层拦截所有 HTTP 请求，返回模拟数据。Mock 数据支持：

- 分页查询、关键词搜索、状态筛选
- 交易审核（通过/驳回）实时更新数据
- 仪表盘统计数据与交易数据联动

### 状态管理

- **appStore**：侧边栏折叠、主题切换、页面标题
- **authStore**：登录状态、Token 管理
- **permissionStore**：角色权限计算
- **todoStore**：自定义待办 CRUD、自动待办计数、已读标记

### 测试

```bash
# 单元测试（Vitest）
npm test                # 147 个测试用例，17 个测试文件

# E2E 测试（Playwright）
npx playwright test
```

## Docker 部署

### 开发环境

```bash
docker compose up -d
# 访问 http://localhost:5173
```

### 生产环境

```bash
docker build -f Dockerfile.prod -t bank-admin .
docker run -p 80:80 bank-admin
```

## 编码规范

- **类型安全**：所有函数入参/返回值显式声明类型
- **错误处理**：异步操作使用 try-catch + 友好提示
- **提前返回**：loading/error 状态提前 return
- **常量集中**：枚举、配置统一在 `constants.ts` 管理
- **格式化集中**：日期、金额、脱敏等在 `format.ts` 管理
- **魔法数字禁止**：分页大小、金额阈值等使用命名常量

## License

Private
