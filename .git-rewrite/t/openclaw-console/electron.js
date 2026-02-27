const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

// 开发模式判断
const isDev = !app.isPackaged

// 获取正确的资源路径
function getResourcePath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar')
  }
  return __dirname
}

function createWindow() {
  // 读取保存的窗口状态
  let windowState = { width: 1280, height: 800, x: undefined, y: undefined }
  
  // 尝试从多个位置读取窗口状态
  const possiblePaths = [
    path.join(__dirname, 'window-state.json'),
    path.join(app.getPath('userData'), 'window-state.json')
  ]
  
  for (const statePath of possiblePaths) {
    try {
      if (fs.existsSync(statePath)) {
        windowState = JSON.parse(fs.readFileSync(statePath, 'utf8'))
        break
      }
    } catch (e) {}
  }

  const win = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    x: windowState.x,
    y: windowState.y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: 'OpenClaw Console',
    show: false  // 先不显示，等加载完成后再显示
  })

  // 确定 dist 路径
  let indexPath
  if (app.isPackaged) {
    // 打包后：app.asar/dist/index.html
    indexPath = path.join(__dirname, 'dist', 'index.html')
  } else {
    // 开发模式：从项目根目录
    indexPath = path.join(__dirname, 'dist', 'index.html')
  }
  
  console.log('Loading:', indexPath)
  console.log('Is packaged:', app.isPackaged)
  console.log('App path:', app.getAppPath())
  console.log('__dirname:', __dirname)
  
  // 加载页面
  win.loadFile(indexPath).then(() => {
    // 加载成功后显示窗口
    win.show()
    console.log('Window loaded successfully')
  }).catch(err => {
    console.error('Failed to load:', err)
    win.show()  // 即使失败也显示窗口，以便看到错误
  })
  
  // 不再自动打开开发者工具
  // if (isDev) {
  //   win.webContents.openDevTools()
  // }
  
  // 保存窗口状态
  const saveWindowState = () => {
    try {
      const bounds = win.getBounds()
      const savePath = app.isPackaged 
        ? path.join(app.getPath('userData'), 'window-state.json')
        : path.join(__dirname, 'window-state.json')
      fs.writeFileSync(savePath, JSON.stringify(bounds))
    } catch (e) {
      console.log('保存窗口状态失败', e)
    }
  }
  
  win.on('resize', saveWindowState)
  win.on('move', saveWindowState)
  
  // 页面加载错误处理
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })
  
  // 控制台日志
  win.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Browser console:', message)
  })
}

app.whenReady().then(() => {
  createWindow()
  
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
