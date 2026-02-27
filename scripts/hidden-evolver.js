/**
 * 隐藏窗口启动 evolver
 * 用 PowerShell Start-Process -WindowStyle Hidden 启动
 */

const { spawn } = require('child_process');
const path = require('path');

const evolverPath = process.argv[2] || path.resolve(__dirname, '../../evolver/index.js');
const args = process.argv.slice(3);

// 用 PowerShell 隐藏窗口
const psCommand = `Start-Process -FilePath "node" -ArgumentList '${evolverPath}', '${args.join("', '")}' -WindowStyle Hidden -PassThru | Select-Object -ExpandProperty Id`;

const child = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psCommand], {
    detached: true,
    stdio: 'ignore',
    shell: false,
    windowsHide: true
});

child.unref();
console.log('Started hidden evolver process');
