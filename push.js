const { execSync } = require('child_process');
try {
  execSync('git add .', { cwd: 'D:/OpenClaw/workspace', encoding: 'utf8' });
  console.log('added');
  execSync('git commit -m "Add all workspace files"', { cwd: 'D:/OpenClaw/workspace', encoding: 'utf8' });
  console.log('committed');
  execSync('git push -u origin master', { cwd: 'D:/OpenClaw/workspace', encoding: 'utf8' });
  console.log('pushed');
} catch (e) {
  console.log(e.message);
}
