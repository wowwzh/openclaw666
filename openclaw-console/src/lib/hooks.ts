// ============================================
// React Hooks 工具库
// ============================================

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// ========== 常用 Hooks ==========

/** 防抖 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

/** 节流 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay = 500
): T {
  const lastRun = useRef(Date.now())

  return useCallback(
    ((...args) => {
      const now = Date.now()
      if (now - lastRun.current >= delay) {
        lastRun.current = now
        callback(...args)
      }
    }) as T,
    [callback, delay]
  )
}

/** 本地存储 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

/** 媒体查询 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

/** 窗口大小 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handler = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return size
}

/** 异步加载 */
export function useAsync<T>(asyncFn: () => Promise<T>, deps: any[] = []) {
  const [state, setState] = useState<{
    loading: boolean
    data?: T
    error?: Error
  }>({ loading: false })

  useEffect(() => {
    let mounted = true

    setState({ loading: true })
    asyncFn()
      .then(data => {
        if (mounted) setState({ loading: false, data })
      })
      .catch(error => {
        if (mounted) setState({ loading: false, error })
      })

    return () => { mounted = false }
  }, deps)

  return state
}

/** 轮询 */
export function usePolling<T>(fn: () => Promise<T>, interval = 5000) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const poll = useCallback(async () => {
    try {
      const result = await fn()
      setData(result)
      setError(null)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }, [fn])

  useEffect(() => {
    poll()
    const id = setInterval(poll, interval)
    return () => clearInterval(id)
  }, [poll, interval])

  return { data, loading, error, refetch: poll }
}

/** 键盘快捷键 */
export function useKeyPress(targetKey: string, handler: () => void) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        handler()
      }
    }

    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [targetKey, handler])
}

/** 鼠标位置 */
export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  return position
}

/** 滚动位置 */
export function useScrollPosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handler = () => {
      setPosition({ x: window.scrollX, y: window.scrollY })
    }

    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return position
}

/** 计时器 */
export function useTimer(initial = 0) {
  const [time, setTime] = useState(initial)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(t => t + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const start = () => setIsRunning(true)
  const stop = () => setIsRunning(false)
  const reset = () => { setTime(0); setIsRunning(false) }

  return { time, isRunning, start, stop, reset }
}

/** 复制到剪贴板 */
export function useClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch {
      return false
    }
  }, [])

  return { copied, copy }
}

/** 确认对话框 */
export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<{
    title?: string
    message?: string
    onConfirm?: () => void
  }>({})

  const confirm = useCallback((config?: any) => {
    setConfig(config || {})
    setIsOpen(true)
  }, [])

  const handleConfirm = useCallback(() => {
    config.onConfirm?.()
    setIsOpen(false)
  }, [config])

  const handleCancel = useCallback(() => {
    setIsOpen(false)
  }, [])

  return { isOpen, config, confirm, handleConfirm, handleCancel }
}

/** 递增 ID */
export function useId() {
  const idRef = useRef(0)
  return useCallback(() => ++idRef.current, [])
}

/** 缓存计算结果 */
export function useMemoized<T>(fn: () => T, deps: any[]) {
  const cache = useRef<{ deps: any[]; value: T }>()

  if (!cache.current || !deps.every((d, i) => d === cache.current!.deps[i])) {
    cache.current = { deps, value: fn() }
  }

  return cache.current.value
}

/** 切换 */
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue(v => !v), [])
  return [value, toggle, setValue] as const
}
