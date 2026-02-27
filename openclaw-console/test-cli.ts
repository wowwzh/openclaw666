// 测试CLI调用
import { execSync } from 'child_process';

const CLI = 'D:\\OpenClaw\\.openclaw\\openclaw\\openclaw.mjs';

const result = execSync(`node "${CLI}" channels list`, { encoding: 'utf8', timeout: 30000 });
console.log(result);
