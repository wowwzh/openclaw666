# 前端学习项目架构设计

> 版本：v1.0 | 日期：2026-02-21 | 适用技术栈：React + TypeScript + Vite

---

## 1. 项目整体结构

```
frontend-learning-project/
├── public/                     # 静态资源（favicon, robots.txt 等）
├── src/
│   ├── assets/                 # 静态资源（图片、字体、图标）
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   │
│   ├── components/             # 业务组件（页面级组件）
│   │   ├── common/             # 通用业务组件
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Sidebar/
│   │   ├── features/           # 功能模块组件
│   │   │   ├── auth/
│   │   │   ├── user/
│   │   │   └── learning/
│   │   └── layouts/            # 布局组件
│   │       ├── MainLayout/
│   │       ├── AuthLayout/
│   │       └── BlankLayout/
│   │
│   ├── core/                   # 核心层
│   │   ├── components/         # 基础 UI 组件库
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.module.css
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Select/
│   │   │   ├── Table/
│   │   │   ├── Dropdown/
│   │   │   ├── Toast/
│   │   │   ├── Loading/
│   │   │   ├── Form/
│   │   │   ├── Pagination/
│   │   │   └── index.ts         # 统一导出
│   │   │
│   │   ├── hooks/              # 组合式 API hooks
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useThrottle.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useToggle.ts
│   │   │   ├── useClickOutside.ts
│   │   │   ├── useRequest/          # 封装请求 hook
│   │   │   │   ├── useRequest.ts
│   │   │   │   └── types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils/              # 工具函数
│   │   │   ├── format/             # 格式化工具
│   │   │   │   ├── date.ts
│   │   │   │   ├── currency.ts
│   │   │   │   └── string.ts
│   │   │   ├── validation/         # 校验工具
│   │   │   │   ├── email.ts
│   │   │   │   ├── phone.ts
│   │   │   │   └── index.ts
│   │   │   ├── storage.ts          # 本地存储封装
│   │   │   ├── request.ts          # axios 封装
│   │   │   ├── crypto.ts           # 加密工具
│   │   │   └── index.ts
│   │   │
│   │   └── constants/          # 常量定义
│   │       ├── index.ts
│   │       ├── config.ts
│   │       └── regex.ts
│   │
│   ├── styles/                 # 全局样式系统
│   │   ├── themes/             # 主题系统
│   │   │   ├── index.ts
│   │   │   ├── light.ts
│   │   │   ├── dark.ts
│   │   │   └── types.ts
│   │   ├── tokens/             # 设计 tokens
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   ├── spacing.ts
│   │   │   ├── border.ts
│   │   │   └── index.ts
│   │   ├── mixins/             # CSS 混入
│   │   │   ├── index.scss
│   │   │   ├── flexbox.scss
│   │   │   ├── text.scss
│   │   │   └── animation.scss
│   │   ├── global.scss         # 全局样式
│   │   ├── reset.scss          # CSS 重置
│   │   └── index.scss          # 样式入口
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Home/
│   │   ├── User/
│   │   ├── Course/
│   │   ├── Lesson/
│   │   └── NotFound/
│   │
│   ├── router/                 # 路由系统
│   │   ├── index.ts            # 路由入口
│   │   ├── routes.ts           # 路由配置
│   │   ├── guards/             # 路由守卫
│   │   │   ├── authGuard.ts
│   │   │   ├── permissionGuard.ts
│   │   │   └── index.ts
│   │   ├── interceptors/       # 路由拦截器
│   │   │   └── index.ts
│   │   └── types.ts            # 路由类型定义
│   │
│   ├── store/                  # 状态管理
│   │   ├── index.ts            # store 入口
│   │   ├── slices/             # 状态分片
│   │   │   ├── userSlice.ts
│   │   │   ├── appSlice.ts
│   │   │   ├── cartSlice.ts
│   │   │   └── index.ts
│   │   ├── middleware/         # 中间件
│   │   │   ├── logger.ts
│   │   │   └── persist.ts
│   │   └── hooks.ts            # typed hooks
│   │
│   ├── services/               # API 服务层
│   │   ├── api/                # API 接口定义
│   │   │   ├── user.ts
│   │   │   ├── course.ts
│   │   │   └── index.ts
│   │   ├── axios/              # axios 配置
│   │   │   ├── index.ts
│   │   │   ├── instance.ts
│   │   │   ├── interceptors/
│   │   │   └── types.ts
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript 类型定义
│   │   ├── global.d.ts         # 全局类型声明
│   │   ├── api.d.ts            # API 类型
│   │   └── components.d.ts     # 组件类型扩展
│   │
│   ├── locales/                # 国际化
│   │   ├── index.ts
│   │   ├── en-US.json
│   │   ├── zh-CN.json
│   │   └── types.ts
│   │
│   ├── App.tsx                 # 根组件
│   ├── main.tsx                # 入口文件
│   └── env.d.ts                # 环境变量类型
│
├── .env                        # 环境变量
├── .env.development
├── .env.production
├── .eslintrc.json              # ESLint 配置
├── .prettierrc                 # Prettier 配置
├── tsconfig.json               # TypeScript 配置
├── vite.config.ts              # Vite 配置
└── package.json
```

---

## 2. 组件库设计

### 2.1 设计原则

| 原则 | 说明 |
|------|------|
| **原子化** | 从最小可复用单元（原子）逐步构建 |
| **单向数据流** | Props 传入，Events 传出 |
| **受控/非受控分离** | 同时支持受控和非受控模式 |
| **TypeScript First** | 完整类型推导，拒绝 any |
| **无副作用** | 组件应该是纯函数式 |

### 2.2 组件分类

```
core/components/
├── atoms/          # 原子组件（最底层）
│   ├── Button
│   ├── Icon
│   ├── Badge
│   └── Tag
├── molecules/      # 分子组件（原子组合）
│   ├── InputGroup
│   ├── SearchBar
│   └── Card
├── organisms/     # 有机体（复杂业务单元）
│   ├── DataTable
│   ├── TreeSelect
│   └── FormGenerator
└── templates/     # 模板（页面骨架）
    ├── AuthTemplate
    └── DashboardTemplate
```

### 2.3 组件模板示例

```tsx
// core/components/Button/Button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/core/utils/cn';
import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(styles.button, styles[variant], styles[size], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? <span className={styles.spinner} /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

---

## 3. 样式系统设计

### 3.1 设计 Tokens

```typescript
// styles/tokens/colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    500: '#6b7280',
    900: '#111827',
  },
  // ...
} as const;
```

### 3.2 主题系统

```typescript
// styles/themes/types.ts
export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  borderRadius: string;
  shadows: Record<string, string>;
}

// styles/themes/light.ts
export const lightTheme: Theme = {
  colors,
  typography,
  spacing,
  borderRadius: '8px',
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};
```

### 3.3 CSS Modules + CSS Variables

```scss
// Button.module.css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &.primary {
    background-color: var(--color-primary-600);
    color: white;
  }
}
```

---

## 4. 路由系统设计

### 4.1 路由配置

```typescript
// router/routes.ts
import { RouteObject } from 'react-router-dom';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: homeLoader,
      },
      {
        path: 'courses',
        element: <CoursesPage />,
        children: [
          {
            path: ':courseId',
            element: <CourseDetailPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
```

### 4.2 路由守卫

```typescript
// router/guards/authGuard.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// router/guards/permissionGuard.tsx
export function PermissionGuard({
  children,
  permission,
}: {
  children: React.ReactNode;
  permission: string;
}) {
  const { permissions } = useAppSelector((state) => state.user);

  if (!permissions.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
```

---

## 5. 状态管理设计

### 5.1 使用 Redux Toolkit

```typescript
// store/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: UserState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, setToken, logout, setLoading } = userSlice.actions;
export default userSlice.reducer;
```

### 5.2 异步 Thunk

```typescript
// store/slices/userSlice.ts (继续)
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
```

### 5.3 类型化的 Hooks

```typescript
// store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## 6. 项目初始化脚本

### 6.1 推荐的 package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,json}\"",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "prepare": "husky install"
  }
}
```

---

## 7. 技术选型总结

| 领域 | 推荐方案 | 理由 |
|------|----------|------|
| **框架** | React 18+ | 生态最完善，组合式 API |
| **语言** | TypeScript | 类型安全，IDE 支持 |
| **构建** | Vite | 极速开发体验 |
| **路由** | React Router 6 | 官方推荐，Data API |
| **状态** | Redux Toolkit | 最佳实践，TypeScript 支持 |
| **样式** | CSS Modules + CSS Variables | 作用域隔离，主题支持 |
| **请求** | Axios + React Query | 请求缓存，状态管理 |
| **表单** | React Hook Form | 性能好，类型推断 |
| **测试** | Vitest + React Testing Library | 快，ESM 原生支持 |
| **代码规范** | ESLint + Prettier + Husky | 统一风格，提交检查 |

---

## 8. 目录使用约定

| 目录 | 用途 | 导入别名 |
|------|------|----------|
| `@/core/components` | 基础 UI 组件 | `@/components` |
| `@/components` | 业务组件 | 无 |
| `@/pages` | 页面组件 | 无 |
| `@/store` | 状态管理 | `@/store` |
| `@/router` | 路由配置 | `@/router` |
| `@/services` | API 服务 | `@/services` |
| `@/styles` | 样式系统 | 无 |
| `@/types` | 类型定义 | 无 |
| `@/locales` | 国际化 | 无 |
| `@/utils` | 工具函数 | `@/utils` |
| `@/assets` | 静态资源 | `@/assets` |

---

*架构持续迭代中...*
