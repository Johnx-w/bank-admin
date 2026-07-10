# ---- 阶段 1：构建 ----
# 选 alpine 而不是完整版：镜像小 10 倍（50MB vs 500MB）
FROM node:22-alpine AS builder

WORKDIR /app

# 先只拷依赖清单。这样做的好处：
# 代码经常改，但依赖不常改，Docker 会缓存这一层
# 后续改代码重新构建时，npm ci 不需要重跑
COPY package.json package-lock.json ./
RUN npm ci

# 拷源码 + 构建
COPY . .
RUN npx vite build

# ---- 阶段 2：运行 ----
# 换 nginx 镜像，前面的 Node/node_modules/源码全部扔掉
# 最终镜像只有 nginx + dist 静态文件 = ~20MB
FROM nginx:stable-alpine

# 从构建阶段拿 dist/，放到 nginx 默认静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA 路由 fallback：所有路径都返回 index.html
# React Router 在浏览器端接管路由
RUN echo 'server { \
  listen 80; \
  root /usr/share/nginx/html; \
  index index.html; \
  location / { \
    try_files $uri $uri/ /index.html; \
  } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
