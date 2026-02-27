/**
 * 米家智能家居控制
 * 封装 python-miio CLI
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.resolve(__dirname, '../../memory/mi_devices.json');

/**
 * 加载设备配置
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {}
  return { devices: {} };
}

/**
 * 保存设备配置
 */
function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

/**
 * 执行 miiocli 命令
 */
function runMiiocli(cmd, ip, token) {
  try {
    const result = execSync(`miiocli device --ip ${ip} --token ${token} ${cmd}`, {
      encoding: 'utf8',
      timeout: 10000
    });
    return { success: true, output: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/**
 * 添加设备
 */
function addDevice(name, ip, token) {
  const config = loadConfig();
  config.devices[name] = { ip, token };
  saveConfig(config);
  return { name, ip, token };
}

/**
 * 获取设备列表
 */
function listDevices() {
  const config = loadConfig();
  return Object.entries(config.devices).map(([name, info]) => ({
    name,
    ip: info.ip,
    token: info.token ? info.token.slice(0, 8) + '...' : 'N/A'
  }));
}

/**
 * 设备控制命令
 */
const commands = {
  // 通用
  status: 'status',
  info: 'info',
  
  // 开关
  on: 'on',
  off: 'off',
  
  // 扫地机器人
  start: 'start',
  stop: 'stop',
  pause: 'pause',
  home: 'home',
  
  // 灯具
  brightness: (level) => `brightness ${level}`,
  color_temp: (temp) => `color_temperature ${temp}`,
};

/**
 * 控制设备
 */
function control(deviceName, action, params = {}) {
  const config = loadConfig();
  const device = config.devices[deviceName];
  
  if (!device) {
    return { success: false, error: `设备 ${deviceName} 不存在` };
  }
  
  let cmd = action;
  if (typeof commands[action] === 'function') {
    cmd = commands[action](params);
  } else if (commands[action]) {
    cmd = commands[action];
  }
  
  return runMiiocli(cmd, device.ip, device.token);
}

/**
 * 云端获取 Token (需要用户名密码)
 */
function cloudLogin(username, password) {
  try {
    const result = execSync(`miiocli cloud --username ${username} --password ${password}`, {
      encoding: 'utf8',
      timeout: 30000
    });
    return { success: true, output: result };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// CLI 接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const action = args[0];
  
  if (action === 'list') {
    console.log(JSON.stringify(listDevices(), null, 2));
  } else if (action === 'add' && args[1] && args[2] && args[3]) {
    console.log(JSON.stringify(addDevice(args[1], args[2], args[3]), null, 2));
  } else if (action === 'status' && args[1]) {
    console.log(JSON.stringify(control(args[1], 'status'), null, 2));
  } else if (action === 'on' && args[1]) {
    console.log(JSON.stringify(control(args[1], 'on'), null, 2));
  } else if (action === 'off' && args[1]) {
    console.log(JSON.stringify(control(args[1], 'off'), null, 2));
  } else {
    console.log(`
米家智能家居控制

用法:
  node mi-home.js list                              # 列出所有设备
  node mi-home.js add <名称> <IP> <Token>          # 添加设备
  node mi-home.js status <名称>                    # 获取设备状态
  node mi-home.js on <名称>                        # 打开设备
  node mi-home.js off <名称>                       # 关闭设备
    `);
  }
}

module.exports = { addDevice, listDevices, control, cloudLogin };
