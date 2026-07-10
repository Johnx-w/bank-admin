---
name: commit-message-rewrite
description: '项目收尾时，根据每次 Git 提交的实际变更内容，分析并批量重写为规范的 Conventional Commit 风格备注（type + 中文描述）。Use when: 项目开发完成、需要整理 Git 历史、批量修改 commit message、Git rebase 重命名提交、规范化提交信息。'
argument-hint: '[--dry-run | --execute]'
user-invocable: true
---

# 提交备注重写 Skill

## 适用场景
- 项目功能开发完毕后，整理 Git 提交历史
- 将不规范的 commit message 批量改为 Conventional Commit 规范
- 让 GitHub 上的提交历史更加专业和可读
- **只改 message，不改文件内容**

## 整体流程

```
查看所有提交 → 逐条查看变更文件 → 分析并拟定新 message → 用户确认 → 执行批量重写 → 强制推送
```

---

## 步骤 1：查看所有提交

```bash
git log --oneline --all --reverse
```

## 步骤 2：逐条分析每次提交的变更

对每条提交执行：

```bash
git show <commit-hash> --stat
```

根据文件变更判断提交类型：

| 关键词/模式 | 类型 | 说明 |
|------------|------|------|
| 搭建项目、初始化、config/tsconfig/vite/package | `feat: 初始化...` | 脚手架 |
| 组件、页面、布局、路由、Mock | `feat: 实现/添加...` | 功能 |
| API 层、状态管理、Hooks | `feat: 添加...` | 功能 |
| 测试文件、vitest、__tests__ | `test: 添加...测试` | 测试 |
| Bug 修复、只有少量修改 | `fix: 修复...` | 修复 |
| 配置/代码风格/文档清理/electron | `chore: ...` | 杂项 |
| CI/CD、Docker、GitHub Actions | `ci: ...` | CI/CD |

## 步骤 3：拟定新 message 并请用户确认

- 格式：`<type>: <中文描述>`
- 中文描述要**精确反映该次提交做的具体事情**，参考 `git show --stat` 中的文件名
- 用表格列出「当前 → 推荐」对比，等待用户确认

## 步骤 4：批量执行重写

使用 `git filter-branch --msg-filter` 方式，一条命令批量修改。

参考脚本模板：[rewrite-messages.sh](./scripts/rewrite-messages.sh)

### 操作步骤：

1. 根据确认后的对照表，填入脚本模板中的 case 分支
2. 在项目根目录创建 `rewrite-messages.sh` 脚本
3. 执行脚本：`<git-bash-path>\sh.exe rewrite-messages.sh`
4. 验证结果：`git log --oneline`
5. 强制推送：
   ```bash
   git push --force-with-lease
   # 如果失败（filter-branch 重写了 remote tracking ref）：
   git push --force
   ```
6. 清理临时脚本：删除 `rewrite-messages.sh`

---

## 注意事项

- ⚠️ **仅限单人分支使用**，多人协作勿用 `--force`
- ⚠️ 文件内容完全不变，只改 commit message
- `--force-with-lease` 优先，失败再用 `--force`
- 如需修改文件内容，改用 `git rebase -i` 的 `edit` 模式

## Conventional Commit 类型速查

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `test` | 测试 |
| `chore` | 构建/工具/配置/杂项 |
| `ci` | CI/CD |
| `docs` | 文档 |
| `refactor` | 重构 |
| `style` | 代码风格 |
