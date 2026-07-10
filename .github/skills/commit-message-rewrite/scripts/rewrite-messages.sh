#!/bin/sh
# ============================================================
# 批量修改 Git Commit Message 脚本
# 用法: sh rewrite-messages.sh
# 注意: 执行后需 git push --force 推送到远程
# ============================================================
#
# 使用方法：
# 1. 在下面的 case 分支中填入每个 commit 的完整 hash 和新 message
# 2. 格式：<完整hash>) echo "新message";;
# 3. *) cat;;  表示其他提交保持原 message 不变

git filter-branch -f --msg-filter '
case "$GIT_COMMIT" in
# ====== 在下面按格式填入你的更改 ======
# 示例:
# a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0) echo "feat: 初始化项目脚手架";;
# =====================================
*) cat;;
esac
' -- --all

echo ""
echo "============================================"
echo "修改完成！请运行以下命令验证并推送："
echo "  git log --oneline"
echo "  git push --force"
echo "============================================"
