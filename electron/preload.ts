/**
 * Electron preload 脚本（最小化）
 *
 * 预留 contextBridge 接口，当前不暴露任何 API 到渲染进程。
 * 可扩展点：如需从主进程向渲染进程暴露安全 API（如文件对话框），
 *   在此文件中使用 contextBridge.exposeInMainWorld 添加。
 */

// 空导出确保 TypeScript 编译
export {};