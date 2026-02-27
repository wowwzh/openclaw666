import { describe, it, expect, beforeEach } from 'vitest'
import { add, subtract, multiply, divide, percentage, negate, clear } from './calculator'

describe('Calculator - 单元测试', () => {
  describe('add - 加法', () => {
    it('应该正确计算两个正数相加', () => {
      expect(add(2, 3)).toBe(5)
    })

    it('应该正确计算负数相加', () => {
      expect(add(-2, -3)).toBe(-5)
    })

    it('应该正确计算正负数相加', () => {
      expect(add(-2, 3)).toBe(1)
    })

    it('应该正确计算小数相加', () => {
      expect(add(0.1, 0.2)).toBeCloseTo(0.3)
    })

    it('0 + 任何数应该等于该数', () => {
      expect(add(0, 5)).toBe(5)
    })
  })

  describe('subtract - 减法', () => {
    it('应该正确计算两个正数相减', () => {
      expect(subtract(5, 3)).toBe(2)
    })

    it('应该正确计算负数相减', () => {
      expect(subtract(-2, -3)).toBe(1)
    })

    it('应该正确计算正负数相减', () => {
      expect(subtract(3, -2)).toBe(5)
    })

    it('相同数相减应该等于0', () => {
      expect(subtract(5, 5)).toBe(0)
    })
  })

  describe('multiply - 乘法', () => {
    it('应该正确计算两个正数相乘', () => {
      expect(multiply(3, 4)).toBe(12)
    })

    it('应该正确计算负数相乘', () => {
      expect(multiply(-3, 4)).toBe(-12)
    })

    it('两个负数相乘应该得到正数', () => {
      expect(multiply(-3, -4)).toBe(12)
    })

    it('任何数乘以0应该等于0', () => {
      expect(multiply(5, 0)).toBe(0)
    })

    it('任何数乘以1应该等于该数', () => {
      expect(multiply(5, 1)).toBe(5)
    })
  })

  describe('divide - 除法', () => {
    it('应该正确计算两个正数相除', () => {
      expect(divide(10, 2)).toBe(5)
    })

    it('应该正确计算负数相除', () => {
      expect(divide(-10, 2)).toBe(-5)
    })

    it('两个负数相除应该得到正数', () => {
      expect(divide(-10, -2)).toBe(5)
    })

    it('应该正确计算小数除法', () => {
      expect(divide(10, 4)).toBe(2.5)
    })

    it('除以1应该等于原数', () => {
      expect(divide(5, 1)).toBe(5)
    })

    it('除以0应该抛出错误', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
    })
  })

  describe('percentage - 百分比', () => {
    it('应该正确计算100的百分比', () => {
      expect(percentage(100)).toBe(1)
    })

    it('应该正确计算50的百分比', () => {
      expect(percentage(50)).toBe(0.5)
    })

    it('应该正确计算0的百分比', () => {
      expect(percentage(0)).toBe(0)
    })

    it('应该正确计算小数的百分比', () => {
      expect(percentage(25.5)).toBe(0.255)
    })
  })

  describe('negate - 取反', () => {
    it('应该正确取反正数', () => {
      expect(negate(5)).toBe(-5)
    })

    it('应该正确取反负数', () => {
      expect(negate(-5)).toBe(5)
    })

    it('0取反应该等于0', () => {
      // -0 和 +0 在数学上相等，使用 toBeCloseTo 比较
      expect(negate(0)).toBeCloseTo(0)
    })
  })

  describe('clear - 清除', () => {
    it('应该返回空字符串', () => {
      expect(clear()).toBe('')
    })
  })
})
