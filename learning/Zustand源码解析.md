# Zustand 状态管理源码解析

> 学习时间：2026-02-22

---

## 一、核心原理

Zustand 是一个轻量级状态管理库，核心只有200多行代码。

### 1.1 核心API

```typescript
// 创建 store
const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}))
```

### 1.2 原理图解

```
create(createState)
       ↓
   createStore(createState)  // vanilla store
       ↓
   useStore (React hook)
       ↓
   useSyncExternalStore   // React 18 并发安全
```

---

## 二、源码解析

### 2.1 vanilla.ts - 核心 Store

```typescript
// 简化版
function createStore(createState) {
  let state
  const listeners = new Set()
  
  const setState = (partial) => {
    state = typeof partial === 'function' ? partial(state) : partial
    listeners.forEach(listener => listener())
  }
  
  const getState = () => state
  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }
  
  state = createState(setState, getState, { ... })
  
  return { getState, setState, subscribe, ... }
}
```

### 2.2 react.ts - React Hook

```typescript
// 核心实现
export function useStore(api, selector = identity) {
  const slice = useSyncExternalStore(
    api.subscribe,
    () => selector(api.getState()),
    () => selector(api.getInitialState())
  )
  return slice
}
```

**关键点：使用 useSyncExternalStore 确保 React 18 并发安全**

---

## 三、与 Redux 对比

| 特性 | Zustand | Redux |
|------|---------|-------|
| 代码量 | ~200行 | ~1000行 |
| Boilerplate | 极少 | 需 Actions/Reducers |
| 异步 | 原生支持 | 需中间件 |
| DevTools | 支持 | 支持 |
| 学习曲线 | 低 | 高 |

---

## 四、最佳实践

### 4.1 基础使用

```typescript
const useStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// 使用
const user = useStore((state) => state.user)
```

### 4.2 派生状态

```typescript
// 不推荐：每次都计算
const doubleCount = () => count * 2

// 推荐：使用 selector
const doubleCount = useStore((state) => state.count * 2)
```

### 4.3 拆分 Store

```typescript
// 用户相关
const useUserStore = create((set) => ({ ... }))

// UI相关
const useUIStore = create((set) => ({ ... }))

// 项目相关
const useProjectStore = create((set) => ({ ... }))
```

---

## 五、常见问题

### Q1: 组件不更新？
- 检查 selector 是否返回新引用
- 检查是否正确使用 useStore

### Q2: 性能问题？
- 使用 shallow 比较
- 拆分 store 减少订阅范围

### Q3: 异步处理？
```typescript
const useStore = create((set) => ({
  data: null,
  fetchData: async () => {
    const res = await api.get()
    set({ data: res })
  }
}))
```

---

## 六、总结

Zustand 核心优势：
1. **轻量** - 无 Boilerplate
2. **高性能** - 精确订阅
3. **简单** - 易于理解
4. **灵活** - 支持中间件

适合中小型项目，大型项目仍推荐 Redux Toolkit。
