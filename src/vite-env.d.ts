/// <reference types="vite/client" />

/**
 * 环境变量类型声明
 * 在 .env 文件中新增变量时，在此 interface 中添加对应字段以获得类型提示
 */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}