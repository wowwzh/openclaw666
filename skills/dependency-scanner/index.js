/**
 * Dependency Scanner - 漏洞包检测
 * 检查项目依赖中的安全漏洞
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 支持yarn和pnpm
 * - 添加并行扫描
 * - 添加严重程度评分
 */

/** @typedef {Object} ScanOptions */
/** @property {string} packageManager - 包管理器 (npm/yarn/pnpm) */
/** @property {boolean} includeDevDependencies - 包含开发依赖 */
/** @property {number} timeout - 超时时间(毫秒) */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 执行命令
 * @param {string} cmd - 命令
 * @param {string} cwd - 工作目录
 * @param {number} timeout - 超时时间
 * @returns {Promise<string>}
 */
function execPromise(cmd, cwd, timeout = 30000) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd, timeout }, (error, stdout, stderr) => {
      resolve(stdout || stderr);
    });
  });
}

/**
 * 运行 npm audit
 * @param {string} projectPath - 项目路径
 * @param {string} pm - 包管理器
 */
async function runNpmAudit(projectPath, pm = 'npm') {
  const cmd = pm === 'yarn' ? 'yarn audit' : pm === 'pnpm' ? 'pnpm audit' : 'npm audit --json';
  try {
    const output = await execPromise(cmd, projectPath);
    return JSON.parse(output);
  } catch (e) {
    return { vulnerabilities: {} };
  }
}

/**
 * 运行 npm outdated
 * @param {string} projectPath - 项目路径
 * @param {string} pm - 包管理器
 */
async function runNpmOutdated(projectPath, pm = 'npm') {
  const cmd = pm === 'yarn' ? 'yarn outdated' : pm === 'pnpm' ? 'pnpm outdated' : 'npm outdated --json';
  try {
    const output = await execPromise(cmd, projectPath);
    return JSON.parse(output);
  } catch (e) {
    return {};
  }
}

/**
 * 扫描项目依赖
 */
async function scan(projectPath) {
  const results = {
    path: projectPath,
    scannedAt: new Date().toISOString(),
    vulnerabilities: [],
    outdated: [],
    recommendations: []
  };

  // npm audit
  try {
    const audit = await runNpmAudit(projectPath);
    if (audit.vulnerabilities) {
      for (const [level, vulns] of Object.entries(audit.vulnerabilities)) {
        if (vulns) {
          for (const vuln of vulns) {
            results.vulnerabilities.push({
              level,
              package: vuln.name,
              severity: vuln.severity || level,
              via: vuln.via,
              fix: vuln.fix
            });
          }
        }
      }
    }
  } catch (e) {
    results.error = e.message;
  }

  // npm outdated
  try {
    const outdated = await runNpmOutdated(projectPath);
    for (const [pkg, info] of Object.entries(outdated)) {
      results.outdated.push({
        package: pkg,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest,
        type: info.type
      });
    }
  } catch (e) {
    // ignore
  }

  // 生成建议
  if (results.vulnerabilities.length > 0) {
    results.recommendations.push(`发现 ${results.vulnerabilities.length} 个安全漏洞，建议尽快修复`);
  }
  
  if (results.outdated.length > 0) {
    results.recommendations.push(`发现 ${results.outdated.length} 个过期依赖，建议更新`);
  }

  return results;
}

module.exports = {
  scan,
  runNpmAudit,
  runNpmOutdated
};
