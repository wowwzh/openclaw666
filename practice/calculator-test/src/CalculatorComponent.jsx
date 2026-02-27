import { useState } from 'react'
import { add, subtract, multiply, divide, clear } from './calculator'

/**
 * Calculator 组件 - 简单的计算器界面
 */
export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [firstOperand, setFirstOperand] = useState(null)
  const [operator, setOperator] = useState(null)
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false)

  // 输入数字
  const inputDigit = (digit) => {
    if (waitingForSecondOperand) {
      setDisplay(digit)
      setWaitingForSecondOperand(false)
    } else {
      setDisplay(display === '0' ? digit : display + digit)
    }
  }

  // 输入小数点
  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.')
      setWaitingForSecondOperand(false)
      return
    }
    if (!display.includes('.')) {
      setDisplay(display + '.')
    }
  }

  // 执行计算
  const calculate = (first, second, op) => {
    switch (op) {
      case '+':
        return add(first, second)
      case '-':
        return subtract(first, second)
      case '*':
        return multiply(first, second)
      case '/':
        return divide(first, second)
      default:
        return second
    }
  }

  // 处理操作符
  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(display)

    if (firstOperand === null) {
      setFirstOperand(inputValue)
    } else if (operator) {
      const result = calculate(firstOperand, inputValue, operator)
      setDisplay(String(result))
      setFirstOperand(result)
    }

    setWaitingForSecondOperand(true)
    setOperator(nextOperator)
  }

  // 等于
  const equals = () => {
    if (firstOperand === null || operator === null) {
      return
    }

    const inputValue = parseFloat(display)
    const result = calculate(firstOperand, inputValue, operator)

    setDisplay(String(result))
    setFirstOperand(null)
    setOperator(null)
    setWaitingForSecondOperand(true)
  }

  // 清除
  const handleClear = () => {
    setDisplay('0')
    setFirstOperand(null)
    setOperator(null)
    setWaitingForSecondOperand(false)
  }

  // 取反
  const handleNegate = () => {
    const value = parseFloat(display)
    setDisplay(String(-value))
  }

  // 百分比
  const handlePercentage = () => {
    const value = parseFloat(display)
    setDisplay(String(value / 100))
  }

  return (
    <div className="calculator" data-testid="calculator">
      <div className="display" data-testid="display">
        {display}
      </div>
      <div className="keypad">
        <button
          className="function-btn"
          onClick={handleClear}
          data-testid="clear-btn"
        >
          AC
        </button>
        <button
          className="function-btn"
          onClick={handleNegate}
          data-testid="negate-btn"
        >
          +/-
        </button>
        <button
          className="function-btn"
          onClick={handlePercentage}
          data-testid="percentage-btn"
        >
          %
        </button>
        <button
          className="operator-btn"
          onClick={() => handleOperator('/')}
          data-testid="divide-btn"
        >
          ÷
        </button>

        <button
          className="digit-btn"
          onClick={() => inputDigit('7')}
          data-testid="digit-7"
        >
          7
        </button>
        <button
          className="digit-btn"
          onClick={() => inputDigit('8')}
          data-testid="digit-8"
        >
          8
        </button>
        <button
          className="digit-btn"
          onClick={() => inputDigit('9')}
          data-testid="digit-9"
        >
          9
        </button>
        <button
          className="operator-btn"
          onClick={() => handleOperator('*')}
          data-testid="multiply-btn"
        >
          ×
        </button>

        <button
          className="digit-btn"
          onClick={() => inputDigit('4')}
          data-testid="digit-4"
        >
          4
        </button>
        <button
          className="digit-btn"
          onClick={() => inputDigit('5')}
          data-testid="digit-5"
        >
          5
        </button>
        <button
          className="digit-btn"
          onClick={() => inputDigit('6')}
          data-testid="digit-6"
        >
          6
        </button>
        <button
          className="operator-btn"
          onClick={() => handleOperator('-')}
          data-testid="subtract-btn"
        >
          -
        </button>

        <button
          className="digit-btn"
          onClick={() => inputDigit('1')}
          data-testid="digit-1"
        >
          1
        </button>
        <button
          className="digit-btn"
          onClick={() => inputDigit('2')}
          data-testid="digit-2"
        >
          2
        </button>
        <button
          className="digit-btn"
          onClick={() => inputDigit('3')}
          data-testid="digit-3"
        >
          3
        </button>
        <button
          className="operator-btn"
          onClick={() => handleOperator('+')}
          data-testid="add-btn"
        >
          +
        </button>

        <button
          className="digit-btn zero-btn"
          onClick={() => inputDigit('0')}
          data-testid="digit-0"
        >
          0
        </button>
        <button
          className="digit-btn"
          onClick={inputDecimal}
          data-testid="decimal-btn"
        >
          .
        </button>
        <button
          className="operator-btn"
          onClick={equals}
          data-testid="equals-btn"
        >
          =
        </button>
      </div>
    </div>
  )
}
