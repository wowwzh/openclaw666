/**
 * 京东外卖优惠券自动领取脚本
 * 使用浏览器自动化领取优惠券
 */

const { spawn } = require('child_process');
const path = require('path');

// 领券链接列表
const COUPON_URLS = [
    'https://u.jd.com/Zg9NHKZ',   // 京东外卖券
    'https://u.jd.com/ZG9cIXr',   // PLUS叠加券
    'https://u.jd.com/Z6992eO',   // 20-15券
    'https://u.jd.com/ZG9JAPf',  // 4-3叠加券
    'https://u.jd.com/ZO979GC',  // 新的4-3券
];

/**
 * 启动浏览器并领取优惠券
 */
async function claimCoupons() {
    console.log('=== 京东外卖优惠券自动领取 ===');
    console.log(`时间: ${new Date().toLocaleString()}`);
    console.log(`优惠券数量: ${COUPON_URLS.length}`);
    
    // 使用 PowerShell 启动浏览器（隐藏窗口）
    const psScript = `
$couponUrls = @(
    'https://u.jd.com/Zg9NHKZ',
    'https://u.jd.com/ZG9cIXr', 
    'https://u.jd.com/Z6992eO',
    'https://u.jd.com/ZG9JAPf',
    'https://u.jd.com/ZO979GC'
)

foreach ($url in $couponUrls) {
    Start-Process msedge "--app=$url"
    Start-Sleep -Seconds 2
}

Write-Host "已打开 $($couponUrls.Count) 个领券页面"
`;
    
    return new Promise((resolve, reject) => {
        const child = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', psScript], {
            detached: true,
            stdio: 'ignore',
            windowsHide: true
        });
        
        child.unref();
        
        child.on('close', (code) => {
            console.log('浏览器已启动，请手动领取优惠券');
            resolve();
        });
        
        child.on('error', (err) => {
            console.error('启动浏览器失败:', err.message);
            reject(err);
        });
        
        // 5秒后自动结束
        setTimeout(() => resolve(), 5000);
    });
}

// CLI 接口
if (require.main === module) {
    claimCoupons().then(() => {
        console.log('完成');
    }).catch(err => {
        console.error('错误:', err);
        process.exit(1);
    });
}

module.exports = { claimCoupons, COUPON_URLS };
