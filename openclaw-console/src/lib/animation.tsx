// ============================================
// 动画效果
// ============================================

import { ReactNode } from 'react'

// 动画类型
type AnimationType = 
  | 'fade' | 'fade-in' | 'fade-out'
  | 'slide' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down'
  | 'zoom' | 'zoom-in' | 'zoom-out'
  | 'bounce' | 'shake' | 'pulse'
  | 'flip' | 'rotate'

// 动画配置
interface AnimationConfig {
  duration?: number
  delay?: number
  easing?: string
  infinite?: boolean
}

// CSS 动画类
const animations: Record<AnimationType, string> = {
  'fade': 'animate-fade',
  'fade-in': 'animate-fade-in',
  'fade-out': 'animate-fade-out',
  'slide': 'animate-slide',
  'slide-left': 'animate-slide-left',
  'slide-right': 'animate-slide-right',
  'slide-up': 'animate-slide-up',
  'slide-down': 'animate-slide-down',
  'zoom': 'animate-zoom',
  'zoom-in': 'animate-zoom-in',
  'zoom-out': 'animate-zoom-out',
  'bounce': 'animate-bounce',
  'shake': 'animate-shake',
  'pulse': 'animate-pulse',
  'flip': 'animate-flip',
  'rotate': 'animate-rotate',
}

// 动画样式
export const animationStyles = `
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideLeft { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideRight { from { transform: translateX(-20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes zoomIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes zoomOut { from { transform: scale(1.1); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes flip { from { transform: perspective(400px) rotateY(0); } to { transform: perspective(400px) rotateY(360deg); } }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
  .animate-fade-out { animation: fadeOut 0.3s ease-out forwards; }
  .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
  .animate-slide-down { animation: slideDown 0.3s ease-out forwards; }
  .animate-slide-left { animation: slideLeft 0.3s ease-out forwards; }
  .animate-slide-right { animation: slideRight 0.3s ease-out forwards; }
  .animate-zoom-in { animation: zoomIn 0.3s ease-out forwards; }
  .animate-zoom-out { animation: zoomOut 0.3s ease-out forwards; }
  .animate-bounce { animation: bounce 0.6s ease-in-out; }
  .animate-shake { animation: shake 0.5s ease-in-out; }
  .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
  .animate-flip { animation: flip 0.6s ease-in-out; }
  .animate-rotate { animation: rotate 1s linear infinite; }
`

// 动画 Hook
export function useAnimation(type: AnimationType, config: AnimationConfig = {}) {
  const { duration = 300, delay = 0, easing = 'ease-out' } = config
  
  const style = {
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationTimingFunction: easing,
  }

  return {
    className: animations[type],
    style,
  }
}

// 过渡效果 Hook
export function useTransition(visible: boolean) {
  return {
    className: visible ? 'animate-fade-in' : 'animate-fade-out',
    style: { display: visible ? 'block' : 'none' },
  }
}

// ========== 加载动画 ==========

export function LoadingSpinner({ size = 'md', color = 'primary' }: { 
  size?: 'sm' | 'md' | 'lg' 
  color?: 'primary' | 'white' | 'gray'
}) {
  const sizeMap = { sm: 16, md: 24, lg: 40 }
  const colorMap = {
    primary: 'border-blue-500',
    white: 'border-white',
    gray: 'border-gray-500',
  }

  return (
    <div 
      className={`animate-rotate border-2 border-t-transparent rounded-full ${colorMap[color]}`}
      style={{ width: sizeMap[size], height: sizeMap[size] }}
    />
  )
}

// ========== 骨架屏 ==========

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

// ========== 淡入淡出组件 ==========

interface FadeProps {
  in: boolean
  children: ReactNode
  duration?: number
}

export function Fade({ in: inProp, children, duration = 200 }: FadeProps) {
  return (
    <div
      style={{
        opacity: inProp ? 1 : 0,
        transition: `opacity ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  )
}

// ========== 滑动组件 ==========

interface SlideProps extends FadeProps {
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function Slide({ in: inProp, children, direction = 'up', duration = 200 }: SlideProps) {
  const transforms = {
    up: 'translateY(20px)',
    down: 'translateY(-20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  }

  return (
    <div
      style={{
        opacity: inProp ? 1 : 0,
        transform: inProp ? 'none' : transforms[direction],
        transition: `all ${duration}ms ease-in-out`,
      }}
    >
      {children}
    </div>
  )
}

// ========== 数字滚动 ==========

import { useState, useEffect, useRef } from 'react'

interface CountUpProps {
  end: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
}

export function CountUp({ end, duration = 1000, decimals = 0, prefix = '', suffix = '' }: CountUpProps) {
  const [count, setCount] = useState(0)
  const startTime = useRef<number>()

  useEffect(() => {
    startTime.current = Date.now()
    const step = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime.current!) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      
      setCount(end * eased)
      
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    
    requestAnimationFrame(step)
  }, [end, duration])

  return (
    <span>
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  )
}
