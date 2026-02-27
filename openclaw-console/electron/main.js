// ============================================
// Electron Main Process
// ============================================

import { app, BrowserWindow, ipcMain, shell, Menu, Tray, nativeImage, dialog } from 'electron'
import path from 'path'
import { spawn, ChildProcess } from 'child_process'

// 开发模式
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// 窗口
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let gatewayProcess: ChildProcess | null = null

// 创建窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'OpenClaw Console',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  })

  // 加载页面
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // 关闭最小化到托盘
  mainWindow.on('close', (event) => {
    if (tray) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })
}

// 创建托盘
function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon)
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示', click: () => mainWindow?.show() },
    { label: '隐藏', click: () => mainWindow?.hide() },
    { type: 'separator' },
    { label: '退出', click: () => {
      tray = null
      app.quit()
    }}
  ])
  
  tray.setToolTip('OpenClaw Console')
  tray.setContextMenu(contextMenu)
  tray.on('click', () => mainWindow?.show())
}

// 创建菜单
function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: '文件',
      submenu: [
        { label: '新建会话', accelerator: 'CmdOrCtrl+N', click: () => mainWindow?.webContents.send('menu:new-chat') },
        { type: 'separator' },
        { label: '设置', accelerator: 'CmdOrCtrl+,', click: () => mainWindow?.webContents.send('menu:settings') },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于', click: () => {
          dialog.showMessageBox(mainWindow!, {
            type: 'info',
            title: '关于 OpenClaw Console',
            message: 'OpenClaw Console v1.0.0',
            detail: 'OpenClaw AI Agent Desktop Client\n基于 Electron + React 构建'
          })
        }}
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC 处理
function setupIPC() {
  // 窗口控制
  ipcMain.on('window:minimize', () => mainWindow?.minimize())
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow?.maximize()
    }
  })
  ipcMain.on('window:close', () => mainWindow?.close())
  
  // 打开外部链接
  ipcMain.on('shell:open', (_, url: string) => shell.openExternal(url))
  
  // Gateway 控制
  ipcMain.handle('gateway:start', async () => {
    // 启动 Gateway
    return { success: true }
  })
  
  ipcMain.handle('gateway:stop', async () => {
    // 停止 Gateway
    return { success: true }
  })
  
  ipcMain.handle('gateway:status', async () => {
    // 获取状态
    return { state: 'running', port: 18789 }
  })
}

// 应用事件
app.whenReady().then(() => {
  createWindow()
  createMenu()
  createTray()
  setupIPC()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// 导出
export { mainWindow }
