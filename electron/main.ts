/**
 * Electron 主进程
 *
 * 负责创建 BrowserWindow、系统托盘、自定义应用菜单。
 * 核心 Web 逻辑（src/）与 Electron 完全解耦，移除 electron/ 目录即可转为纯 B/S 架构。
 */
import { app, BrowserWindow, Tray, Menu, nativeImage } from "electron";
import * as path from "path";

/** 主窗口实例 */
let mainWindow: BrowserWindow | null = null;
/** 系统托盘实例 */
let tray: Tray | null = null;

/** 判断是否为开发模式 */
const isDev = process.env.NODE_ENV === "development";
/** 预加载脚本路径（预留） */
const PRELOAD_PATH = path.join(__dirname, "preload.js");

/**
 * 创建主窗口
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "银行后台管理系统",
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // 开发模式加载 Vite 开发服务器
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    // 生产模式加载打包后的 index.html
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

/**
 * 创建系统托盘
 */
function createTray(): void {
  // 创建一个 16x16 的空图标作为托盘图标（生产环境替换为实际图标）
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("银行后台管理系统");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "显示主窗口",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: "separator" },
    {
      label: "退出",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on("double-click", () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

/**
 * 创建应用菜单
 */
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "文件",
      submenu: [
        { label: "退出", accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "视图",
      submenu: [
        {
          label: "刷新",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow?.webContents.reload(),
        },
        {
          label: "全屏",
          accelerator: "F11",
          click: () => {
            if (mainWindow) {
              mainWindow.setFullScreen(!mainWindow.isFullScreen());
            }
          },
        },
        { type: "separator" },
        ...(isDev
          ? [
              {
                label: "开发者工具",
                accelerator: "F12",
                click: () => mainWindow?.webContents.toggleDevTools(),
              },
            ]
          : []),
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "关于",
          click: () => {
            const { dialog } = require("electron");
            dialog.showMessageBox(mainWindow!, {
              type: "info",
              title: "关于",
              message: "银行后台管理系统",
              detail: "版本: " + app.getVersion(),
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ---- 应用生命周期 ----

app.whenReady().then(() => {
  createWindow();
  createTray();
  createMenu();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});