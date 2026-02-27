/**
 * 今日代码练习 - 2026-02-21
 * 主题：前端UI基础 - 卡片布局
 */

// 模拟数据
const cards = [
  { title: 'HTML5', desc: '语义化标签', color: '#e34f26' },
  { title: 'CSS3', desc: '样式与布局', color: '#1572b6' },
  { title: 'JavaScript', desc: '交互逻辑', color: '#f7df1e' },
  { title: 'Flexbox', desc: '弹性布局', color: '#3b82f6' },
  { title: 'Grid', desc: '网格布局', color: '#10b981' },
  { title: '响应式', desc: '移动优先', color: '#8b5cf6' },
];

// 生成HTML卡片
function renderCards() {
  return cards.map(card => `
    <div class="card" style="background: ${card.color}">
      <h3>${card.title}</h3>
      <p>${card.desc}</p>
    </div>
  `).join('');
}

// CSS布局要点
const flexboxTips = [
  'display: flex - 启用弹性布局',
  'justify-content - 主轴对齐方式',
  'align-items - 交叉轴对齐',
  'flex-wrap - 换行控制',
  'gap - 项目间距',
];

// 练习输出
console.log('=== 前端UI学习 - 代码练习 ===');
console.log('今日掌握：');
cards.forEach(c => console.log(`- ${c.title}: ${c.desc}`));
console.log('\nFlexbox核心属性：');
flexboxTips.forEach(t => console.log(t));

// 简单算法：数组去重
const arr = [1, 2, 2, 3, 3, 3, 4, 5, 5];
const unique = [...new Set(arr)];
console.log('\n算法练习 - 数组去重：');
console.log('输入:', arr);
console.log('输出:', unique);
