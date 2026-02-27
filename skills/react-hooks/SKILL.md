# React组件与Hooks技能

构建现代React组件的最佳实践。

## Hooks基础

```jsx
import { useState, useEffect, useMemo, useCallback } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 状态
  const [data, setData] = useState(null);
  
  // 副作用
  useEffect(() => {
    fetchData();
  }, []); // 空依赖 = 只执行一次
  
  // 记忆化
  const memoValue = useMemo(() => computeExpensive(a, b), [a, b]);
  const handleClick = useCallback(() => doSomething(), [dep]);
  
  return <div>{count}</div>;
}
```

## 常用Hooks

| Hook | 用途 |
|------|------|
| useState | 状态 |
| useEffect | 副作用 |
| useMemo | 缓存计算结果 |
| useCallback | 缓存函数 |
| useRef | 引用DOM |
| useContext | 跨组件传值 |
| useReducer | 复杂状态逻辑 |

## 性能优化

```jsx
// 1. useMemo 缓存计算
const filteredList = useMemo(
  () => list.filter(item => item.active),
  [list]
);

// 2. useCallback 防止子组件重渲染
const handleSubmit = useCallback(() => {
  submitForm(data);
}, [data]);

// 3. React.memo 包装子组件
const List = React.memo(({ items }) => (
  <ul>{items.map(i => <li>{i}</li>)}</ul>
));
```

## 状态管理

```jsx
// Zustand (轻量)
import create from 'zustand';
const useStore = create(set => ({
  count: 0,
  inc: () => set(s => ({ count: s.count + 1 }))
}));

// 使用
function Counter() {
  const { count, inc } = useStore();
  return <button onClick={inc}>{count}</button>;
}
```

## 最佳实践

1. 依赖项要写全
2. useEffect用于副作用
3. 大列表用useMemo
4. 回调用useCallback
5. 状态提升要适度
