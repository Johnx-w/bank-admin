设计 Vitest 测试用例时遵守以下规则：

### Mock 与模块导入
1. 使用 vi.mock() 进行模块级 mock（会自动 hoist），不要在 describe/it 内部动态 mock
2. 被测模块如有**模块级副作用**（如 axios.create() 注册拦截器），
   必须在 beforeAll 中一次性 import，后续测试复用已注册的函数引用，
   严禁在每个测试里重复 import 再重新注册
3. 需要捕获 mock 函数的调用参数时，在 mock factory 外部声明变量捕获，
   不要事后从 mock.calls 中回溯

### 测试隔离
4. beforeEach 只做数据清空（localStorage.clear()、vi.clearAllMocks()），
   不要清空 mock 拦截器引用或存储在闭包中的函数引用
5. 拦截器/中间件是有状态闭包的，测试通过控制输入数据（如 localStorage）
   来改变行为，而不是重置函数本身

### 运行环境
6. 如果被测代码使用了浏览器 API（localStorage、sessionStorage、DOM 等），
   必须设置 environment: "jsdom"，不能用 "node"
7. 如果只想个别测试文件用 jsdom，在文件顶部加 // @vitest-environment jsdom

### 测试设计
8. 优先用纯函数的输入/输出验证，避免测试实现细节
9. 每个测试应该独立——清理自己的输入数据，断言自己的输出
10. 边界条件必须覆盖：空值、不存在、网络错误等