/**
 * Electron 预加载脚本
 *
 * 使用 contextBridge 向渲染进程安全地暴露主进程 API。
 * 当前版本暴露最小接口集，按需扩展。
 *
 * 安全原则：
 * - 不暴露 nodeIntegration
 * - 所有主进程通信通过 contextBridge 白名单通道
 * - 不允许渲染进程直接访问 Node.js API
 */
import { contextBridge, ipcRenderer } from "electron";

/**
 * 暴露给渲染进程的安全 API
 *
 * 访问方式：window.electronAPI.xxx
 */
contextBridge.exposeInMainWorld("electronAPI", {
  /** 获取应用版本号 */
  getVersion: (): Promise<string> => ipcRenderer.invoke("get-version"),

  /** 获取当前运行平台 */
  getPlatform: (): string => process.platform,

  /** 是否为开发模式 */
  isDev: process.env.NODE_ENV === "development",
});
