/**
 * Saga 订单处理架构
 * 事件驱动的分布式事务处理
 * 
 * 原理：将大事务拆分为多个小步骤，每步有正向和补偿操作
 * 
 * v1.1 优化:
 * - 添加JSDoc类型注解
 * - 添加配置选项
 * - 添加更多便捷方法
 * - 改进错误处理
 */

const EventEmitter = require('events');

/**
 * 步骤执行函数类型
 * @typedef {Function} ExecuteFn
 * @param {Object} context - 上下文
 * @returns {Promise<Object>} 执行结果
 */

/**
 * 步骤补偿函数类型
 * @typedef {Function} CompensateFn
 * @param {Object} result - 执行结果
 * @returns {Promise<void>}
 */

/**
 * Saga 步骤定义
 * @class
 */
class SagaStep {
  /**
   * @param {string} name - 步骤名称
   * @param {ExecuteFn} execute - 执行函数
   * @param {CompensateFn} compensate - 补偿函数
   */
  constructor(name, execute, compensate) {
    this.name = name;
    this.execute = execute;
    this.compensate = compensate;
    this.completed = false;
  }
}

/**
 * Saga 编排器
 * @class
 */
class Saga extends EventEmitter {
  /**
   * @param {Object} options - 配置选项
   */
  constructor(options = {}) {
    super();
    this.steps = [];
    this.compensated = [];
    this.continueOnError = options.continueOnError || false;
  }

  /**
   * 添加步骤
   */
  addStep(name, execute, compensate) {
    this.steps.push(new SagaStep(name, execute, compensate));
    return this;
  }

  /**
   * 执行 Saga
   */
  async execute(context = {}) {
    const results = [];
    let currentContext = { ...context };

    for (const step of this.steps) {
      try {
        this.emit('step:start', step.name);
        
        // 执行步骤
        const result = await step.execute(currentContext);
        step.completed = true;
        
        // 保存结果用于补偿
        results.push({ step: step.name, result });
        currentContext = { ...currentContext, ...result };
        
        this.emit('step:complete', step.name, result);
      } catch (error) {
        this.emit('error', { step: step.name, error });
        
        // 开始补偿
        await this.compensate(results);
        
        return {
          success: false,
          failedAt: step.name,
          error: error.message
        };
      }
    }

    return { success: true, context: currentContext };
  }

  /**
   * 补偿操作（回滚）
   */
  async compensate(results) {
    this.emit('compensate:start');

    // 逆序补偿
    for (let i = results.length - 1; i >= 0; i--) {
      const { step, result } = results[i];
      const sagaStep = this.steps.find(s => s.name === step);
      
      if (sagaStep && sagaStep.compensate) {
        try {
          this.emit('compensate:step', step);
          await sagaStep.compensate(result);
          this.emit('compensate:step:complete', step);
        } catch (error) {
          this.emit('compensate:error', { step, error });
        }
      }
    }

    this.emit('compensate:complete');
  }
}

/**
 * 订单 Saga 示例
 */
async function createOrderSaga() {
  const saga = new Saga();

  // 步骤1: 验证库存
  saga.addStep(
    'validate_inventory',
    async (ctx) => {
      // 检查库存
      return { inventoryValid: true };
    },
    async (result) => {
      // 补偿: 恢复库存
      console.log('Restoring inventory...');
    }
  );

  // 步骤2: 扣款
  saga.addStep(
    'charge_payment',
    async (ctx) => {
      // 扣款
      return { charged: true, amount: ctx.amount };
    },
    async (result) => {
      // 补偿: 退款
      console.log('Refunding...');
    }
  );

  // 步骤3: 创建订单
  saga.addStep(
    'create_order',
    async (ctx) => {
      // 创建订单
      return { orderId: 'ORDER_123' };
    },
    async (result) => {
      // 补偿: 取消订单
      console.log('Cancelling order...');
    }
  );

  return saga;
}

module.exports = {
  Saga,
  SagaStep,
  createOrderSaga,
  // v1.1 便捷函数
  createSaga: (options) => new Saga(options),
  createStep: (name, execute, compensate) => new SagaStep(name, execute, compensate)
};
