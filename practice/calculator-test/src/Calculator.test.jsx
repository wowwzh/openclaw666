import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Calculator from './CalculatorComponent'

describe('Calculator - 组件测试', () => {
  let calculator

  beforeEach(() => {
    calculator = render(<Calculator />)
  })

  describe('渲染测试', () => {
    it('应该渲染计算器组件', () => {
      expect(screen.getByTestId('calculator')).toBeInTheDocument()
    })

    it('应该渲染显示区域', () => {
      expect(screen.getByTestId('display')).toBeInTheDocument()
    })

    it('初始显示应该为0', () => {
      expect(screen.getByTestId('display')).toHaveTextContent('0')
    })

    it('应该渲染所有数字按钮 (0-9)', () => {
      for (let i = 0; i <= 9; i++) {
        expect(screen.getByTestId(`digit-${i}`)).toBeInTheDocument()
      }
    })

    it('应该渲染操作符按钮 (+, -, *, /)', () => {
      expect(screen.getByTestId('add-btn')).toBeInTheDocument()
      expect(screen.getByTestId('subtract-btn')).toBeInTheDocument()
      expect(screen.getByTestId('multiply-btn')).toBeInTheDocument()
      expect(screen.getByTestId('divide-btn')).toBeInTheDocument()
    })

    it('应该渲染功能按钮 (AC, +/-, %, =, .)', () => {
      expect(screen.getByTestId('clear-btn')).toBeInTheDocument()
      expect(screen.getByTestId('negate-btn')).toBeInTheDocument()
      expect(screen.getByTestId('percentage-btn')).toBeInTheDocument()
      expect(screen.getByTestId('equals-btn')).toBeInTheDocument()
      expect(screen.getByTestId('decimal-btn')).toBeInTheDocument()
    })
  })

  describe('交互测试 - 数字输入', () => {
    it('点击数字应该更新显示', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('digit-5'))
      expect(screen.getByTestId('display')).toHaveTextContent('5')
    })

    it('连续点击多个数字应该正确显示', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('digit-1'))
      await user.click(screen.getByTestId('digit-2'))
      await user.click(screen.getByTestId('digit-3'))
      expect(screen.getByTestId('display')).toHaveTextContent('123')
    })

    it('点击0应该显示0', async () => {
      const user = userEvent.setup()
      await user.click(screen.getByTestId('digit-0'))
      expect(screen.getByTestId('display')).toHaveTextContent('0')
    })
  })

  describe('交互测试 - 加法', () => {
    it('应该正确计算 2 + 3 = 5', async () => {
      const user = userEvent.setup()
      
      // 输入 2
      await user.click(screen.getByTestId('digit-2'))
      // 点击 +
      await user.click(screen.getByTestId('add-btn'))
      // 输入 3
      await user.click(screen.getByTestId('digit-3'))
      // 点击 =
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('5')
    })

    it('应该正确计算多个数相加', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-1'))
      await user.click(screen.getByTestId('add-btn'))
      await user.click(screen.getByTestId('digit-2'))
      await user.click(screen.getByTestId('add-btn'))
      await user.click(screen.getByTestId('digit-3'))
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('6')
    })
  })

  describe('交互测试 - 减法', () => {
    it('应该正确计算 10 - 3 = 7', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-1'))
      await user.click(screen.getByTestId('digit-0'))
      await user.click(screen.getByTestId('subtract-btn'))
      await user.click(screen.getByTestId('digit-3'))
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('7')
    })
  })

  describe('交互测试 - 乘法', () => {
    it('应该正确计算 4 * 5 = 20', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-4'))
      await user.click(screen.getByTestId('multiply-btn'))
      await user.click(screen.getByTestId('digit-5'))
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('20')
    })
  })

  describe('交互测试 - 除法', () => {
    it('应该正确计算 20 / 4 = 5', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-2'))
      await user.click(screen.getByTestId('digit-0'))
      await user.click(screen.getByTestId('divide-btn'))
      await user.click(screen.getByTestId('digit-4'))
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('5')
    })
  })

  describe('交互测试 - 小数点', () => {
    it('应该正确输入小数', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-1'))
      await user.click(screen.getByTestId('decimal-btn'))
      await user.click(screen.getByTestId('digit-5'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('1.5')
    })
  })

  describe('交互测试 - 清除功能 (AC)', () => {
    it('点击清除按钮应该重置显示为0', async () => {
      const user = userEvent.setup()
      
      // 输入一些数字
      await user.click(screen.getByTestId('digit-1'))
      await user.click(screen.getByTestId('digit-2'))
      await user.click(screen.getByTestId('digit-3'))
      
      // 点击清除
      await user.click(screen.getByTestId('clear-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('0')
    })
  })

  describe('交互测试 - 取反功能 (+/-)', () => {
    it('点击取反应该改变数字符号', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-5'))
      await user.click(screen.getByTestId('negate-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('-5')
    })

    it('再次取反应该恢复原值', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-5'))
      await user.click(screen.getByTestId('negate-btn'))
      await user.click(screen.getByTestId('negate-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('5')
    })
  })

  describe('交互测试 - 百分比功能 (%)', () => {
    it('应该正确计算百分比', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-5'))
      await user.click(screen.getByTestId('digit-0'))
      await user.click(screen.getByTestId('percentage-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('0.5')
    })
  })

  describe('交互测试 - 复杂运算', () => {
    it('应该正确计算 (2 + 3) * 4 = 20', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-2'))
      await user.click(screen.getByTestId('add-btn'))
      await user.click(screen.getByTestId('digit-3'))
      await user.click(screen.getByTestId('multiply-btn'))
      await user.click(screen.getByTestId('digit-4'))
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('20')
    })

    it('应该正确计算 10 - 2 * 3 = 4 (先乘后减)', async () => {
      const user = userEvent.setup()
      
      await user.click(screen.getByTestId('digit-1'))
      await user.click(screen.getByTestId('digit-0'))
      await user.click(screen.getByTestId('subtract-btn'))
      await user.click(screen.getByTestId('digit-2'))
      await user.click(screen.getByTestId('multiply-btn'))
      await user.click(screen.getByTestId('digit-3'))
      await user.click(screen.getByTestId('equals-btn'))
      
      expect(screen.getByTestId('display')).toHaveTextContent('4')
    })
  })
})
