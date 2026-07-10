# 开发模式 Dockerfile — 跑 Vite dev server + MSW Mock
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npx", "vite", "--host", "0.0.0.0"]
