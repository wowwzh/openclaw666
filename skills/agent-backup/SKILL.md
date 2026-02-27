# AI Agent状态备份与恢复技能

自动备份Agent核心文件，一键恢复。

## 核心文件

```
workspace/
├── AGENTS.md      # Agent配置
├── SOUL.md        # Agent人格
├── MEMORY.md      # 长期记忆
├── USER.md        # 用户信息
└── knowledge/    # 知识库
```

## 自动备份

```bash
# 每日cron备份
0 2 * * * tar -czf agent_backup_$(date +\%Y\%m\%d).tgz AGENTS.md SOUL.md MEMORY.md USER.md knowledge/
```

## 一键恢复

```bash
# 解压恢复
tar -xzf agent_backup_20260227.tgz -C ~/workspace/
```

## Python脚本

```python
import os
import tarfile
from datetime import datetime

BACKUP_DIR = './backups'
CORE_FILES = ['AGENTS.md', 'SOUL.md', 'MEMORY.md', 'USER.md']

def backup():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_file = f'{BACKUP_DIR}/agent_{timestamp}.tgz'
    
    with tarfile.open(backup_file, 'w:gz') as tar:
        for f in CORE_FILES:
            if os.path.exists(f):
                tar.add(f)
    
    print(f'Backup saved: {backup_file}')
    return backup_file

def restore(backup_file):
    with tarfile.open(backup_file, 'r:gz') as tar:
        tar.extractall()
    print('Restore completed!')
```

## 配置

```json
{
  "backup": {
    "schedule": "0 2 * * *",
    "retention_days": 30,
    "files": ["AGENTS.md", "SOUL.md", "MEMORY.md", "USER.md", "knowledge/"]
  }
}
```
