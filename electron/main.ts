/**
 * Electron 主进程入口
 *
 * 职责：
 * 1. 创建 BrowserWindow（加载 Vite 开发服务器或构建产物）
 * 2. 注册系统托盘（Tray）+ 右键菜单
 * 3. 注册自定义应用菜单（文件 / 视图 / 帮助）
 * 4. 管理窗口生命周期
 *
 * 与 Web 核心完全解耦：删除 electron/ 目录和 package.json 中
 * electron 相关字段后，项目即退化为纯 B/S 架构。
 *
 * 开发模式：主进程源码为 TypeScript，通过 tsx 直接加载。
 * 生产模式：electron-builder 打包已编译的 JS 产物。
 */
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  dialog,
  type MenuItemConstructorOptions,
} from "electron";
import path from "node:path";

/** 是否开发模式 */
const isDev: boolean =
  process.env.NODE_ENV === "development" ||
  process.argv.includes("--dev") ||
  !app.isPackaged;

/** 主窗口引用 */
let mainWindow: BrowserWindow | null = null;

/** 系统托盘引用 */
let tray: Tray | null = null;

/** 生成 16x16 托盘图标（运行时动态生成，无需外部资源文件） */
function createTrayIcon(): Electron.NativeImage {
  const { nativeImage } = require("electron");
  // 16x16 RGBA 纯色蓝点，简单但够用
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    buffer[i * 4] = 0x16; // R
    buffer[i * 4 + 1] = 0x77; // G
    buffer[i * 4 + 2] = 0xff; // B
    buffer[i * 4 + 3] = 0xff; // A
  }
  return nativeImage.createFromBuffer(buffer, {
    width: size,
    height: size,
  });
}

/** 创建主窗口 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "银行后台管理系统",
    backgroundColor: "#f0f2f5",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // 加载页面
  if (isDev) {
    const devUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    mainWindow.loadURL(devUrl);
    // 开发模式下打开 DevTools（可通过环境变量关闭）
    if (process.env.NO_DEVTOOLS !== "1") {
      mainWindow.webContents.openDevTools({ mode: "detach" });
    }
  } else {
    // 生产模式：加载 Vite 构建产物
    const indexPath = path.join(__dirname, "..", "dist", "index.html");
    mainWindow.loadFile(indexPath);
  }

  // ready-to-show 后再显示，避免白屏闪烁
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/** 创建系统托盘 */
function createTray(): void {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  tray.setToolTip("银行后台管理系统");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示主窗口",
      click: (): void => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: (): void => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // 双击托盘图标恢复窗口
  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

/** 创建应用菜单 */
function createMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: "文件",
      submenu: [
        {
          label: "退出",
          accelerator: "CmdOrCtrl+Q",
          click: (): void => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "视图",
      submenu: [
        {
          label: "刷新",
          accelerator: "CmdOrCtrl+R",
          click: (): void => {
            mainWindow?.webContents.reload();
          },
        },
        {
          label: "切换全屏",
          accelerator: "F11",
          click: (): void => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
        },
        { type: "separator" },
        {
          label: "开发者工具",
          accelerator: "F12",
          click: (): void => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
        { type: "separator" },
        {
          label: "放大",
          accelerator: "CmdOrCtrl+=",
          role: "zoomIn",
        },
        {
          label: "缩小",
          accelerator: "CmdOrCtrl+-",
          role: "zoomOut",
        },
        {
          label: "重置缩放",
          accelerator: "CmdOrCtrl+0",
          role: "resetZoom",
        },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "关于",
          click: (): void => {
            dialog.showMessageBox(mainWindow!, {
              type: "info",
              title: "关于 — 银行后台管理系统",
              message: "银行后台管理系统",
              detail: [
                "版本: " + app.getVersion(),
                "技术栈: React 19 + Ant Design 6 + Electron",
                "面向银行内部运营人员的企业级管理平台",
              ].join("\n"),
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================
// 应用生命周期
// ============================================================

app.whenReady().then(() => {
  createWindow();
  createTray();
  createMenu();
});

// 所有窗口关闭时（非 macOS）
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// macOS 点击 Dock 图标
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 退出前清理
app.on("before-quit", () => {
  tray?.destroy();
  tray = null;
});
