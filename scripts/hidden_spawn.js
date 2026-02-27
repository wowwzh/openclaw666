/**
 * 隐藏窗口启动任意进程
 * 用 PowerShell Start-Process -WindowStyle Hidden
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
if (args.length === 0) {
    console.log('用法: node hidden_spawn.js <node路径> <脚本路径> [参数...]');
    console.log('示例: node hidden_spawn.js node D:\\OpenClaw\\workspace\\evolver\\index.js run --loop');
    process.exit(1);
}

const nodePath = args[0];
const scriptPath = args[1];
const scriptArgs = args.slice(2);

// 构建 PowerShell 命令
const psArgs = [
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-Command',
    `Start-Process -FilePath "${nodePath}" -ArgumentList '${scriptPath}', '${scriptArgs.join("', '")}' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id`
];

console.log('启动隐藏进程:', nodePath, scriptPath, scriptArgs);

const child = spawn('powershell', psArgs, {
    detached: true,
    stdio: 'ignore',
    shell: false,
    windowsHide: true
});

child.unref();
console.log('已启动隐藏进程');
