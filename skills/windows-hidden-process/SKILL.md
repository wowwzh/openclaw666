# Windows 终端命令行隐藏窗口最佳实践

## 问题背景

在 Windows 上使用 Node.js `child_process.spawn()` 启动子进程时，即使设置了 `windowsHide: true`，有时候还是会弹出命令行窗口。

## 正确的隐藏方法

### 方法1: 使用 PowerShell Start-Process (推荐)

```javascript
const { spawn } = require('child_process');

const child = spawn('powershell', [
  '-NoProfile',
  '-ExecutionPolicy', 'Bypass',
  '-Command',
  `Start-Process -FilePath "node" -ArgumentList 'your-script.js' -WindowStyle Hidden -PassThru`
], {
  detached: true,
  stdio: 'ignore',
  shell: false,
  windowsHide: true
});

child.unref();
```

**关键点：**
- 使用 `Start-Process -WindowStyle Hidden` 而不是依赖 spawn 的 `windowsHide`
- `-WindowStyle Hidden` 参数确保窗口完全隐藏

### 方法2: 使用 cmd /c start /b

```javascript
const { spawn } = require('child_process');

const child = spawn('cmd', [
  '/c', 
  'start', 
  '/b', 
  'node', 
  'your-script.js'
], {
  detached: true,
  stdio: 'ignore',
  shell: false,
  windowsHide: true
});

child.unref();
```

**注意：**
- `/b` 表示在当前窗口运行，不打开新窗口
- 这个方法可能不如 PowerShell 方法稳定

### 方法3: 使用 VBScript (最可靠)

创建 `hidden_run.vbs`:

```vbscript
Set WshShell = CreateObject("WScript.Shell")

If WScript.Arguments.Count > 0 Then
    cmd = "node "
    For i = 0 to WScript.Arguments.Count - 1
        cmd = cmd & WScript.Arguments(i) & " "
    Next
    
    ' 0 = 隐藏窗口，False = 不等待进程结束
    WshShell.Run cmd, 0, False
End If
```

调用：

```javascript
const { spawn } = require('child_process');

const child = spawn('wscript', [
  'hidden_run.vbs',
  'your-script.js',
  'arg1',
  'arg2'
], {
  detached: true,
  stdio: 'ignore',
  shell: false
});

child.unref();
```

## spawn 参数详解

| 参数 | 说明 | 注意事项 |
|------|------|----------|
| `detached` | 是否脱离父进程 | 设为 true |
| `stdio` | 标准输入输出 | 用 'ignore' 忽略输出 |
| `shell` | 是否使用 shell | 设为 false 更安全 |
| `windowsHide` | Windows 隐藏窗口 | 不总是有效 |
| `env` | 环境变量 | 继承父进程环境 |

## 常见错误

❌ **错误示例：直接 spawn node**

```javascript
// 这样会在 Windows 上弹出窗口
const child = spawn('node', ['script.js'], {
  detached: true,
  windowsHide: true  // 不够！
});
```

✅ **正确示例：使用 PowerShell**

```javascript
const ps = `Start-Process -FilePath "node" -ArgumentList 'script.js' -WindowStyle Hidden`;
const child = spawn('powershell', ['-Command', ps], {
  detached: true,
  stdio: 'ignore'
});
```

## 在 OpenClaw/PM2 等工具中使用

如果进程被其他工具管理（如 cron），可能需要在工具层面设置：

1. **OpenClaw Cron**: 修改 cron 任务配置
2. **PM2**: 使用 `pm2 start ... --no-autorestart` + 系统服务
3. **Windows 计划任务**: 使用 `/sc ONSTART` + "不启动任何窗口"

## 检测进程是否有窗口

```javascript
const { exec } = require('child_process');

exec('wmic process where "name=\'node.exe\'" get ProcessId,WindowTitle', (err, stdout) => {
  console.log(stdout);
});
```

如果 `WindowTitle` 有值，说明进程有可见窗口。

## 参考

- Node.js 官方文档: https://nodejs.org/api/child_process.html
- Windows PowerShell: `Start-Process -WindowStyle Hidden`
