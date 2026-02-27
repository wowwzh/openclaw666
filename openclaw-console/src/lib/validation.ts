// ============================================
// 验证工具
// ============================================

// ========== 表单验证 ==========

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  phone?: boolean
  custom?: (value: any) => boolean | string
}

interface ValidationError {
  field: string
  message: string
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

class Validator {
  // 验证单个字段
  validate(value: any, rules: ValidationRule, fieldName = 'field'): ValidationError | null {
    // 必填
    if (rules.required && (value === undefined || value === null || value === '')) {
      return { field: fieldName, message: `${fieldName} 是必填的` }
    }

    // 如果值为空且不是必填，跳过其他验证
    if (value === undefined || value === null || value === '') {
      return null
    }

    // 字符串长度
    if (rules.minLength && String(value).length < rules.minLength) {
      return { field: fieldName, message: `${fieldName} 至少需要 ${rules.minLength} 个字符` }
    }
    if (rules.maxLength && String(value).length > rules.maxLength) {
      return { field: fieldName, message: `${fieldName} 最多 ${rules.maxLength} 个字符` }
    }

    // 数字范围
    if (rules.min !== undefined && Number(value) < rules.min) {
      return { field: fieldName, message: `${fieldName} 不能小于 ${rules.min}` }
    }
    if (rules.max !== undefined && Number(value) > rules.max) {
      return { field: fieldName, message: `${fieldName} 不能大于 ${rules.max}` }
    }

    // 正则
    if (rules.pattern && !rules.pattern.test(String(value))) {
      return { field: fieldName, message: `${fieldName} 格式不正确` }
    }

    // 邮箱
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) {
      return { field: fieldName, message: `请输入有效的邮箱地址` }
    }

    // URL
    if (rules.url) {
      try {
        new URL(String(value))
      } catch {
        return { field: fieldName, message: `请输入有效的 URL` }
      }
    }

    // 手机号
    if (rules.phone && !/^1[3-9]\d{9}$/.test(String(value))) {
      return { field: fieldName, message: `请输入有效的手机号码` }
    }

    // 自定义验证
    if (rules.custom) {
      const result = rules.custom(value)
      if (result !== true) {
        return { field: fieldName, message: typeof result === 'string' ? result : `${fieldName} 验证失败` }
      }
    }

    return null
  }

  // 验证多个字段
  validateForm(data: Record<string, any>, schema: Record<string, ValidationRule>): ValidationResult {
    const errors: ValidationError[] = []

    for (const [field, rules] of Object.entries(schema)) {
      const error = this.validate(data[field], rules, field)
      if (error) {
        errors.push(error)
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // 验证单个值返回布尔值
  isValid(value: any, rules: ValidationRule): boolean {
    return this.validate(value, rules) === null
  }
}

export const validator = new Validator()

// ========== 常用验证规则 ==========

export const rules = {
  required: { required: true } as ValidationRule,
  email: { required: true, email: true } as ValidationRule,
  phone: { required: true, phone: true } as ValidationRule,
  url: { url: true } as ValidationRule,
  password: { 
    required: true, 
    minLength: 6, 
    maxLength: 20 
  } as ValidationRule,
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  } as ValidationRule,
}

// ========== 表单辅助 ==========

// 创建表单验证 Hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule>
) {
  const validate = (values: T) => {
    return validator.validateForm(values, validationSchema)
  }

  return { validate }
}
