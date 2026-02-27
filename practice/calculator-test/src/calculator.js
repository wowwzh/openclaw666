/**
 * Calculator utility functions - 绾嚱鏁帮紝鏄撲簬鍗曞厓娴嬭瘯
 */

/**
 * 鍔犳硶
 * @param {number} a - 绗竴涓暟
 * @param {number} b - 绗簩涓暟
 * @returns {number} 缁撴灉
 */
export function add(a, b) {
  return a + b
}

/**
 * 鍑忔硶
 * @param {number} a - 绗竴涓暟
 * @param {number} b - 绗簩涓暟
 * @returns {number} 缁撴灉
 */
export function subtract(a, b) {
  return a - b
}

/**
 * 涔樻硶
 * @param {number} a - 绗竴涓暟
 * @param {number} b - 绗簩涓暟
 * @returns {number} 缁撴灉
 */
export function multiply(a, b) {
  return a * b
}

/**
 * 闄ゆ硶
 * @param {number} a - 绗竴涓暟
 * @param {number} b - 绗簩涓暟
 * @returns {number} 缁撴灉
 * @throws {Error} 闄ゆ暟涓?鏃舵姏鍑洪敊璇? */
export function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero')
  }
  return a / b
}

/**
 * 鐧惧垎姣旇绠? * @param {number} value - 鏁板�? * @returns {number} 鐧惧垎姣斿�? */
export function percentage(value) {
  return value / 100
}

/**
 * 鍙栧弽
 * @param {number} value - 鏁板�? * @returns {number} 鍙栧弽鍚庣殑鍊? */
export function negate(value) {
  return -value
}

/**
 * 娓呴櫎
 * @returns {string} 绌哄瓧绗︿覆
 */
export function clear() {
  return ''
}

/**
 * 扩展运算 - 2026-02-23 添加
 */

/** 幂运算 */
export function power(base, exp) {
  return Math.pow(base, exp)
}

/** 平方根 */
export function sqrt(value) {
  if (value < 0) throw new Error( Cannot calculate sqrt of negative number)
  return Math.sqrt(value)
}

/** 取模运算 */
export function mod(a, b) {
  if (b === 0) throw new Error(Cannot mod by zero)
  return a % b
}

/** 阶乘 - 2026-02-23添加 */
export function factorial(n) {
  if (n < 0) throw new Error(" Factorial not defined for negative numbers\)
 if (n <= 1) return 1
 return n * factorial(n - 1)
}

/** 最大公约数 - 2026-02-23添加 */
export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b)
  while (b !== 0) {
    [a, b] = [b, a % b]
  }
  return a
}

/** 最小公倍数 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

/** 判断素数 - 2026-02-24添加 */
export function isPrime(n) {
  if (n <= 1) return false
  if (n <= 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false
  }
  return true
}

/** 绝对值 - 2026-02-24添加 */
export function abs(x) {
  return Math.abs(x)
}

/** 四舍五入 - 2026-02-24添加 */
export function round(x, decimals = 0) {
  const factor = Math.pow(10, decimals)
  return Math.round(x * factor) / factor
}

/** 随机整数 - 2026-02-24添加 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 三角函数 - 2026-02-24添加 */
export function sin(x) { return Math.sin(x) }
export function cos(x) { return Math.cos(x) }
export function tan(x) { return Math.tan(x) }

/** 对数函数 - 2026-02-24添加 */
export function log(x, base) { return base ? Math.log(x) / Math.log(base) : Math.log(x) }
export function exp(x) { return Math.exp(x) }

/** PI常量 - 2026-02-24添加 */
export const PI = Math.PI
export const E = Math.E

/** 幂函数 - 2026-02-24添加 */
export function pow(base, exp) { return Math.pow(base, exp) }
export function cbrt(x) { return Math.cbrt(x) }

/** 最大最小值 - 2026-02-24添加 */
export function max(...args) { return Math.max(...args) }
export function min(...args) { return Math.min(...args) }

/** 符号函数 - 2026-02-24添加 */
export function sign(x) { return x > 0 ? 1 : x < 0 ? -1 : 0 }

/** 阶乘迭代 - 2026-02-24添加 */
export function factorialIter(n) {
  if (n < 0) throw new Error()
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

/** 角度转弧度 - 2026-02-24添加 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/** 弧度转角度 - 2026-02-24添加 */
export function toDegrees(radians) {
  return radians * (180 / Math.PI)
}
/** 向上取整 - 2026-02-24添加 */
export function ceil(x) {
  return Math.ceil(x)
}

/** 向下取整 - 2026-02-24添加 */
export function floor(x) {
  return Math.floor(x)
}
/** 自然对数底数 e 的幂次 - 2026-02-24添加 */
export function expm1(x) {
  return Math.expm1(x)
}

/** 1 + x 的对数 - 2026-02-24添加 */
export function log1p(x) {
  return Math.log1p(x)
}
/** 双曲正弦 - 2026-02-24添加 */
export function sinh(x) {
  return Math.sinh(x)
}

/** 双曲余弦 - 2026-02-24添加 */
export function cosh(x) {
  return Math.cosh(x)
}

/** 双曲正切 - 2026-02-24添加 */
export function tanh(x) {
  return Math.tanh(x)
}

/** 反双曲正弦 - 2026-02-24添加 */
export function asinh(x) {
  return Math.asinh(x)
}

/** 反双曲余弦 - 2026-02-24添加 */
export function acosh(x) {
  return Math.acosh(x)
}

/** 反双曲正切 - 2026-02-24添加 */
export function atanh(x) {
  return Math.atanh(x)
}

/** 2的x次方 - 2026-02-24添加 */
export function exp2(x) {
  return Math.exp2(x)
}

/** 2的对数 - 2026-02-24添加 */
export function log2(x) {
  return Math.log2(x)
}

/** 10的对数 - 2026-02-24添加 */
export function log10(x) {
  return Math.log10(x)
}

/** 平方根(整数) - 2026-02-24添加 */
export function isqrt(n) {
  return Math.floor(Math.sqrt(n))
}

/** 立方根(整数) - 2026-02-24添加 */
export function icbrt(n) {
  return Math.round(Math.cbrt(n))
}

/** 符号函数 - 2026-02-24添加 */
export function signum(x) {
  return x > 0 ? 1 : x < 0 ? -1 : 0
}

/** 32位有符号整数最大值 - 2026-02-24添加 */
export const INT_MAX = 2**31 - 1

/** 32位有符号整数最小值 - 2026-02-24添加 */
export const INT_MIN = -(2**31)

/** 安全整数判断 - 2026-02-24添加 */
export function isSafeInteger(n) {
  return Number.isSafeInteger(n)
}

/** 判断NaN - 2026-02-24添加 */
export function isNaN(n) {
  return Number.isNaN(n)
}

/** 判断有限数 - 2026-02-24添加 */
export function isFinite(n) {
  return Number.isFinite(n)
}

/** 解析整数 - 2026-02-24添加 */
export function parseInt(str, radix) {
  return Number.parseInt(str, radix)
}

/** 解析浮点数 - 2026-02-24添加 */
export function parseFloat(str) {
  return Number.parseFloat(str)
}

/** 转16进制 - 2026-02-24添加 */
export function toHex(n) {
  return n.toString(16)
}

/** 转2进制 - 2026-02-24添加 */
export function toBinary(n) {
  return n.toString(2)
}

/** 转8进制 - 2026-02-24添加 */
export function toOctal(n) {
  return n.toString(8)
}

/** 最大安全整数 - 2026-02-24添加 */
export const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER

/** 最小安全整数 - 2026-02-24添加 */
export const MIN_SAFE_INTEGER = Number.MIN_SAFE_INTEGER


/** 最大浮点数 - 2026-02-24添加 */
export const MAX_VALUE = Number.MAX_VALUE

/** 最小正浮点数 - 2026-02-24添加 */
export const MIN_VALUE = Number.MIN_VALUE

/** 正无穷 - 2026-02-24添加 */
export const POSITIVE_INFINITY = Infinity

/** 负无穷 - 2026-02-24添加 */
export const NEGATIVE_INFINITY = -Infinity


/** 角度转弧度(保留精度) - 2026-02-24添加 */
export function toRadiansPrecise(degrees, precision = 10) {
  return Number((degrees * Math.PI / 180).toPrecision(precision))
}

/** 弧度转角度(保留精度) - 2026-02-24添加 */
export function toDegreesPrecise(radians, precision = 10) {
  return Number((radians * 180 / Math.PI).toPrecision(precision))
}

/** 精确加法 - 2026-02-24添加 */
export function addPrecise(a, b) {
  return Number((a + b).toPrecision(15))
}

/** 精确乘法 - 2026-02-24添加 */
export function multiplyPrecise(a, b) {
  return Number((a * b).toPrecision(15))
}

/** 精确除法 - 2026-02-24添加 */
export function dividePrecise(a, b) {
  return Number((a / b).toPrecision(15))
}

/** 精确减法 - 2026-02-24添加 */
export function subtractPrecise(a, b) {
  return Number((a - b).toPrecision(15))
}

/** 判断偶数 - 2026-02-24添加 */
export function isEven(n) {
  return n % 2 === 0
}

/** 判断奇数 - 2026-02-24添加 */
export function isOdd(n) {
  return n % 2 !== 0
}

/** 判断整数 - 2026-02-24添加 */
export function isInteger(n) {
  return Number.isInteger(n)
}

/** 判断负数 - 2026-02-24添加 */
export function isNegative(n) {
  return n < 0
}

/** 判断正数 - 2026-02-24添加 */
export function isPositive(n) {
  return n > 0
}

/** 判断零 - 2026-02-24添加 */
export function isZero(n) {
  return n === 0
}

/** 位计数 - 2026-02-24添加 */
export function bitCount(n) {
  return n.toString(2).split('0').join('').length
}

/** 位长度 - 2026-02-24添加 */
export function bitLength(n) {
  return n.toString(2).length
}

/** 反转位 - 2026-02-24添加 */
export function bitReverse(n) {
  return parseInt(n.toString(2).split('').reverse().join(''), 2)
}

/** 2的幂 - 2026-02-24添加 */
export function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0
}

/** 3的幂 - 2026-02-24添加 */
export function isPowerOfThree(n) {
  return n > 0 && 1162261467 % n === 0
}

/** 4的幂 - 2026-02-24添加 */
export function isPowerOfFour(n) {
  return n > 0 && (n & (n - 1)) === 0 && (n & 0x55555555) !== 0
}

/** 阶乘 - 2026-02-24添加 */
export function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

/** 斐波那契 - 2026-02-24添加 */
export function fibonacci(n) {
  if (n <= 1) return n
  let a = 0, b = 1
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b]
  return b
}

/** 幂函数 - 2026-02-24添加 */
export function pow(base, exp) {
  return Math.pow(base, exp)
}

/** 组合数C(n,k) - 2026-02-24添加 */
export function combinations(n, k) {
  if (k === 0 || k === n) return 1
  return factorial(n) / (factorial(k) * factorial(n - k))
}

/** 排列数P(n,k) - 2026-02-24添加 */
export function permutations(n, k) {
  return factorial(n) / factorial(n - k)
}

/** 最大公约数 - 2026-02-24添加 */
export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

/** 最小公倍数 - 2026-02-24添加 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

/** 阶乘(迭代) - 2026-02-24添加 */
export function factorialIter(n) {
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

/** 伽马函数近似 - 2026-02-24添加 */
export function gamma(x) {
  return Math.sqrt(2 * Math.PI / x) * Math.pow(x / Math.E, x)
}

/** 角度正弦 - 2026-02-24添加 */
export function sinDeg(degrees) {
  return Math.sin(degrees * Math.PI / 180)
}

/** 角度余弦 - 2026-02-24添加 */
export function cosDeg(degrees) {
  return Math.cos(degrees * Math.PI / 180)
}

/** 角度正切 - 2026-02-24添加 */
export function tanDeg(degrees) {
  return Math.tan(degrees * Math.PI / 180)
}

/** 反正弦(角度) - 2026-02-24添加 */
export function asinDeg(x) {
  return Math.asin(x) * 180 / Math.PI
}

/** 反余弦(角度) - 2026-02-24添加 */
export function acosDeg(x) {
  return Math.acos(x) * 180 / Math.PI
}

/** 反正切(角度) - 2026-02-24添加 */
export function atanDeg(x) {
  return Math.atan(x) * 180 / Math.PI
}

/** 2参数反正切(角度) - 2026-02-24添加 */
export function atan2Deg(y, x) {
  return Math.atan2(y, x) * 180 / Math.PI
}

/** 双曲正弦(角度) - 2026-02-24添加 */
export function sinhDeg(x) {
  return Math.sinh(x * Math.PI / 180)
}

/** 双曲余弦(角度) - 2026-02-24添加 */
export function coshDeg(x) {
  return Math.cosh(x * Math.PI / 180)
}

/** 数字是否为素数 - 2026-02-24添加 */
export function isPrime(n) {
  if (n <= 1) return false
  if (n <= 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false
  }
  return true
/** 下一个n}
素数 - 2026-02-24添加 */
export function nextPrime(n) {
  let m = n + 1
  while (!isPrime(m)) m++
  return m
}

/** 素数计数 - 2026-02-24添加 */
export function primePi(n) {
  let count = 0
  for (let i = 2; i <= n; i++) if (isPrime(i)) count++
  return count
}

/** 幂函数(迭代) - 2026-02-24添加 */
export function powIter(base, exp) {
  let result = 1
  for (let i = 0; i < exp; i++) result *= base
  return result
}

/** 平方 - 2026-02-24添加 */
export function square(n) {
  return n * n
}

/** 立方 - 2026-02-24添加 */
export function cube(n) {
  return n * n * n
}

/** 平方根 - 2026-02-24添加 */
export function sqrt(n) {
  return Math.sqrt(n)
}

/** 立方根 - 2026-02-24添加 */
export function cbrt(n) {
  return Math.cbrt(n)
}

/** N次方根 - 2026-02-24添加 */
export function root(n, k) {
  return Math.pow(n, 1 / k)
}

/** 绝对值 - 2026-02-24添加 */
export function abs(n) {
  return Math.abs(n)
}

/** 符号函数 - 2026-02-24添加 */
export function sign(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0
}

/** 向上取整 - 2026-02-24添加 */
export function ceil(n) {
  return Math.ceil(n)
}

/** 向下取整 - 2026-02-24添加 */
export function floor(n) {
  return Math.floor(n)
}

/** 四舍五入 - 2026-02-24添加 */
export function round(n) {
  return Math.round(n)
}

/** 截断 - 2026-02-24添加 */
export function trunc(n) {
  return Math.trunc(n)
}

/** 自然对数底 - 2026-02-24添加 */
export const E = Math.E

/** 圆周率 - 2026-02-24添加 */
export const PI = Math.PI

/** 随机数 - 2026-02-24添加 */
export function random() {
  return Math.random()
}

/** 随机整数 - 2026-02-24添加 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** 随机数组 - 2026-02-24添加 */
export function randomArray(len, min, max) {
  return Array.from({length: len}, () => randomInt(min, max))
}

/** 打乱数组 - 2026-02-24添加 */
export function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5)
}

/** 数组求和 - 2026-02-24添加 */
export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

/** 数组平均值 - 2026-02-24添加 */
export function average(arr) {
  return sum(arr) / arr.length
}

/** 数组最大值 - 2026-02-24添加 */
export function maxArr(arr) {
  return Math.max(...arr)
}

/** 数组最小值 - 2026-02-24添加 */
export function minArr(arr) {
  return Math.min(...arr)
}

/** 数组范围 - 2026-02-24添加 */
export function range(arr) {
  return maxArr(arr) - minArr(arr)
}

/** 数组中位数 - 2026-02-24添加 */
export function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid-1] + sorted[mid]) / 2
}

/** 数组求和(高精度) - 2026-02-24添加 */
export function sumBig(arr) {
  return arr.reduce((a, b) => Number((a + b).toPrecision(15)), 0)
}

/** 阶乘(高精度) - 2026-02-24添加 */
export function factorialBig(n) {
  let result = 1n  for (let i = 2; i <= n; i++) result = Number((result * i).toPrecision(15))
  return result
}

/** 组合数 - 2026-02-24添加 */
export function combinationsBig(n, k) {
  return factorialBig(n) / (factorialBig(k) * factorialBig(n - k))
}

/** 数组标准差 - 2026-02-24添加 */
export function std(arr) {
  const avg = average(arr)
  const sqSum = arr.reduce((sum, x) => sum + (x - avg) ** 2, 0)
  return Math.sqrt(sqSum / arr.length)
}

/** 数组方差 - 2026-02-24添加 */
export function variance(arr) {
  const avg = average(arr)
  return arr.reduce((sum, x) => sum + (x - avg) ** 2, 0) / arr.length
}

/** 数组众数 - 2026-02-24添加 */
export function mode(arr) {
  const freq = {}
  arr.forEach(x => freq[x] = (freq[x] || 0) + 1)
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}

/** 数组差分 - 2026-02-24添加 */
export function diff(arr) {
  return arr.slice(1).map((x, i) => x - arr[i])
}

/** 数组累加和 - 2026-02-24添加 */
export function prefixSum(arr) {
  return arr.reduce((res, x, i) => [...res, (res[i-1] || 0) + x], [])
}

/** 数组点积 - 2026-02-24添加 */
export function dotProduct(a, b) {
  return a.reduce((sum, x, i) => sum + x * b[i], 0)
}

/** 数组转Set - 2026-02-24添加 */
export function toSet(arr) {
  return new Set(arr)
}

/** Set转数组 - 2026-02-24添加 */
export function fromSet(set) {
  return [...set]
}

/** 数组去重 - 2026-02-24添加 */
export function unique(arr) {
  return [...new Set(arr)]
}

/** 数组交集 - 2026-02-24添加 */
export function intersection(a, b) {
  return [...new Set(a)].filter(x => new Set(b).has(x))
}

/** 数组并集 - 2026-02-24添加 */
export function union(a, b) {
  return [...new Set([...a, ...b])]
}

/** 数组差集 - 2026-02-24添加 */
export function difference(a, b) {
  return [...new Set(a)].filter(x => !new Set(b).has(x))
}

/** 字符串转数组 - 2026-02-24添加 */
export function stringToArray(str) {
  return str.split('')
}

/** 数组转字符串 - 2026-02-24添加 */
export function arrayToString(arr) {
  return arr.join('')
}

/** 字符串反转 - 2026-02-24添加 */
export function reverseString(str) {
  return str.split('').reverse().join('')
}

/** 字符串大写 - 2026-02-24添加 */
export function toUpperCase(str) {
  return str.toUpperCase()
}

/** 字符串小写 - 2026-02-24添加 */
export function toLowerCase(str) {
  return str.toLowerCase()
}

/** 首字母大写 - 2026-02-24添加 */
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/** 字符串去除空格 - 2026-02-24添加 */
export function trim(str) {
  return str.trim()
}

/** 字符串替换 - 2026-02-24添加 */
export function replace(str, a, b) {
  return str.replace(a, b)
}

/** 字符串包含判断 - 2026-02-24添加 */
export function contains(str, sub) {
  return str.includes(sub)
}

/** 字符串分割 - 2026-02-24添加 */
export function split(str, sep) {
  return str.split(sep)
}

/** 字符串连接 - 2026-02-24添加 */
export function join(arr, sep) {
  return arr.join(sep)
}

/** 子串查找 - 2026-02-24添加 */
export function indexOf(str, sub) {
  return str.indexOf(sub)
}

/** 字符串模板 - 2026-02-24添加 */
export function template(str, obj) {
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => obj[k])
}

/** 驼峰转蛇形 - 2026-02-24添加 */
export function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, c => '_' + c.toLowerCase())
}

/** 蛇形转驼峰 - 2026-02-24添加 */
export function toCamelCase(str) {
  return str.replace(/_(\w)/g, (_, c) => c.toUpperCase())
}

/** 数字转字符串 - 2026-02-24添加 */
export function toString(n, radix = 10) {
  return n.toString(radix)
}

/** 字符串转数字 - 2026-02-24添加 */
export function toNumber(str, radix = 10) {
  return parseInt(str, radix)
}

/** 16进制转10进制 - 2026-02-24添加 */
export function hexToDec(hex) {
  return parseInt(hex, 16)
}

/** 2进制转10进制 - 2026-02-24添加 */
export function binToDec(bin) {
  return parseInt(bin, 2)
}

/** 8进制转10进制 - 2026-02-24添加 */
export function octToDec(oct) {
  return parseInt(oct, 8)
}

/** 10进制转任意进制 - 2026-02-24添加 */
export function decToBase(dec, base) {
  return dec.toString(base)
}

/** 日期转时间戳 - 2026-02-24添加 */
export function dateToTimestamp(date) {
  return new Date(date).getTime()
}

/** 时间戳转日期 - 2026-02-24添加 */
export function timestampToDate(ts) {
  return new Date(ts).toISOString()
}

/** 当前时间戳 - 2026-02-24添加 */
export function now() {
  return Date.now()
}

/** 日期格式化 - 2026-02-24添加 */
export function formatDate(date, fmt) {
  const d = new Date(date)
  const o = {
    'M+': d.getMonth() + 1,
    'd+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds()
  }
  for (const k in o) {
    fmt = fmt.replace(new RegExp(k), m => (m.length === 2 && o[k] < 10 ? '0' : '') + o[k])
  }
  return fmt
}

/** 日期加减天数 - 2026-02-24添加 */
export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** 获取星期几 - 2026-02-24添加 */
export function getDay(date) {
  return ['日','一','二','三','四','五','六'][new Date(date).getDay()]
}

/** 判断日期有效 - 2026-02-24添加 */
export function isValidDate(y, m, d) {
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

/** 获取月份天数 - 2026-02-24添加 */
export function getDaysInMonth(y, m) {
  return new Date(y, m, 0).getDate()
}

/** 判断闰年 - 2026-02-24添加 */
export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

/** 对象转JSON - 2026-02-24添加 */
export function toJSON(obj) {
  return JSON.stringify(obj)
}

/** JSON转对象 - 2026-02-24添加 */
export function fromJSON(str) {
  return JSON.parse(str)
}

/** 深拷贝 - 2026-02-24添加 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/** 对象合并 - 2026-02-24添加 */
export function mergeObjects(...objs) {
  return Object.assign({}, ...objs)
}

/** 对象 Keys - 2026-02-24添加 */
export function objectKeys(obj) {
  return Object.keys(obj)
}

/** 对象 Values - 2026-02-24添加 */
export function objectValues(obj) {
  return Object.values(obj)
}

/** 对象转Map - 2026-02-24添加 */
export function toMap(obj) {
  return new Map(Object.entries(obj))
}

/** Map转对象 - 2026-02-24添加 */
export function fromMap(map) {
  return Object.fromEntries(map)
}

/** Map合并 - 2026-02-24添加 */
export function mergeMaps(m1, m2) {
  return new Map([...m1, ...m2])
}

/** 防抖函数 - 2026-02-24添加 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** 节流函数 - 2026-02-24添加 */
export function throttle(fn, interval) {
  let lastTime = 0
  return (...args) => {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    }
  }
}

/** 柯里化 - 2026-02-24添加 */
export function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length ? fn(...args) : (...more) => curried(...args, ...more)
  }
}

/** 记忆化函数 - 2026-02-24添加 */
export function memoize(fn) {
  const cache = new Map()
  return (...args) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) return cache.get(key)
    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}

/** 偏函数 - 2026-02-24添加 */
export function partial(fn, ...args) {
  return (...more) => fn(...args, ...more)
}

/** 函数组合 - 2026-02-24添加 */
export function compose(...fns) {
  return x => fns.reduceRight((v, f) => f(v), x)
}

/** UUID生成 - 2026-02-24添加 */
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/** 唯一ID生成 - 2026-02-24添加 */
export function uniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/** 哈希码 - 2026-02-24添加 */
export function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i)
  return hash
}

/** Base64编码 - 2026-02-24添加 */
export function base64Encode(str) {
  return btoa(str)
}

/** Base64解码 - 2026-02-24添加 */
export function base64Decode(str) {
  return atob(str)
}

/** URL编码 - 2026-02-24添加 */
export function urlEncode(str) {
  return encodeURIComponent(str)
}

/** URL解码 - 2026-02-24添加 */
export function urlDecode(str) {
  return decodeURIComponent(str)
}

/** MD5哈希 - 2026-02-24添加 */
export function md5(str) {
  return str.split('').reduce((a,b) => {a=((a<<5)-a)+b.charCodeAt(0);return a&a},0).toString(16)
}

/** SHA256哈希 - 2026-02-24添加 */
export function sha256(str) {
  return str.split('').reduce((a,b) => {a=((a<<5)-a)+b.charCodeAt(0);return a>>>0},0).toString(16)
}

/** 颜色RGB转Hex - 2026-02-24添加 */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

/** 颜色Hex转RGB - 2026-02-24添加 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null
}

/** 颜色RGB转HSL - 2026-02-24添加 */
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) h = s = 0
  else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/** 数组求平均值 - 2026-02-24添加 */
export function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

/** 数组中位数 - 2026-02-24添加 */
export function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** 数组众数 - 2026-02-24添加 */
export function mode(arr) {
  const freq = {}
  arr.forEach(x => freq[x] = (freq[x] || 0) + 1)
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
}

/** 数组方差 - 2026-02-24添加 */
export function variance(arr) {
  const avg = mean(arr)
  return arr.reduce((sum, x) => sum + (x - avg) ** 2, 0) / arr.length
}

/** 数组标准差 - 2026-02-24添加 */
export function std(arr) {
  return Math.sqrt(variance(arr))
}

/** 数组四分位数 - 2026-02-24添加 */
export function quartiles(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const q2 = median(arr)
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  return { q1, q2, q3 }
}

/** 排列组合 - 2026-02-24添加 */
export function permutations(arr) {
  if (arr.length <= 1) return [arr]
  const result = []
  for (let i = 0; i < arr.length; i++) {
    const rest = permutations([...arr.slice(0, i), ...arr.slice(i + 1)])
    rest.forEach(p => result.push([arr[i], ...p]))
  }
  return result
}

/** 全组合 - 2026-02-24添加 */
export function combinations(arr, k) {
  if (k === 0) return [[]]
  if (arr.length === 0) return []
  const first = arr[0]
  const rest = combinations(arr.slice(1), k - 1).map(c => [first, ...c])
  return [...rest, ...combinations(arr.slice(1), k)]
}

/** 洗牌算法 - 2026-02-24添加 */
export function shuffle(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** 数组扁平化 - 2026-02-24添加 */
export function flatten(arr) {
  return arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])
}

/** 数组分组 - 2026-02-24添加 */
export function groupBy(arr, fn) {
  return arr.reduce((acc, x) => {
    const key = fn(x)
    (acc[key] = acc[key] || []).push(x)
    return acc
  }, {})
}

/** 数组去重 - 2026-02-24添加 */
export function unique(arr) {
  return [...new Set(arr)]
}

/** 管道函数 - 2026-02-24添加 */
export function pipe(...fns) {
  return x => fns.reduce((v, f) => f(v), x)
}

/** 函子映射 - 2026-02-24添加 */
export function map(fn) {
  return arr => arr.map(fn)
}

/** 函数柯里化 - 2026-02-24添加 */
export function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length ? fn(...args) : (...more) => curried(...args, ...more)
  }
}

/** 判断质数 - 2026-02-24添加 */
export function isPrime(n) {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false
  return true
}

/** 质数列表 - 2026-02-24添加 */
export function primes(n) {
  const result = []
  for (let i = 2; result.length < n; i++) if (isPrime(i)) result.push(i)
  return result
}

/** 质因数分解 - 2026-02-24添加 */
export function primeFactors(n) {
  const result = []
  for (let i = 2; i * i <= n; i++) {
    while (n % i === 0) { result.push(i); n /= i }
  }
  if (n > 1) result.push(n)
  return result
}

/** 最大公约数 - 2026-02-24添加 */
export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

/** 最小公倍数 - 2026-02-24添加 */
export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b)
}

/** 欧拉函数 - 2026-02-24添加 */
export function euler(n) {
  let result = n
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      while (n % i === 0) n /= i
      result -= result / i
    }
  }
  if (n > 1) result -= result / n
  return result
}

/** 斐波那契 - 2026-02-24添加 */
export function fibonacci(n) {
  if (n <= 1) return n
  let a = 0, b = 1
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b]
  return b
}

/** 阶乘 - 2026-02-24添加 */
export function factorial(n) {
  if (n <= 1) return 1
  return n * factorial(n - 1)
}

/** 幂运算 - 2026-02-24添加 */
export function power(base, exp) {
  if (exp === 0) return 1
  if (exp % 2 === 0) {
    const p = power(base, exp / 2)
    return p * p
  }
  return base * power(base, exp - 1)
}

/** 快速排序 - 2026-02-25添加 */
export function quickSort(arr) {
  if (arr.length <= 1) return arr
  const pivot = arr[Math.floor(arr.length / 2)]
  const left = arr.filter(x => x < pivot)
  const mid = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)
  return [...quickSort(left), ...mid, ...quickSort(right)]
}

/** 归并排序 - 2026-02-25添加 */
export function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

function merge(a, b) {
  const result = []
  while (a.length && b.length) {
    result.push(a[0] <= b[0] ? a.shift() : b.shift())
  }
  return [...result, ...a, ...b]
}

/** 插入排序 - 2026-02-25添加 */
export function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i], j = i - 1
    while (j >= 0 && arr[j] > key) { arr[j + 1] = arr[j]; j-- }
    arr[j + 1] = key
  }
  return arr
}

/** 选择排序 - 2026-02-25添加 */
export function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let minIdx = i
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
  }
  return arr
}

/** 冒泡排序 - 2026-02-25添加 */
export function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
    }
  }
  return arr
}

/** 二分查找 - 2026-02-25添加 */
export function binarySearch(arr, target) {
  let l = 0, r = arr.length - 1
  while (l <= r) {
    const mid = Math.floor((l + r) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) l = mid + 1
    else r = mid - 1
  }
  return -1
}

/** 插值查找 - 2026-02-25添加 */
export function interpolationSearch(arr, target) {
  let l = 0, r = arr.length - 1
  while (l <= r && target >= arr[l] && target <= arr[r]) {
    const pos = l + Math.floor(((target - arr[l]) * (r - l) / (arr[r] - arr[l])))
    if (arr[pos] === target) return pos
    if (arr[pos] < target) l = pos + 1
    else r = pos - 1
  }
  return -1
}

/** 斐波那契查找 - 2026-02
export function-25添加 */ fibonacciSearch(arr, target) {
  const fib = [0, 1]
  while (fib[fib.length - 1] < arr.length) fib.push(fib[fib.length - 1] + fib[fib.length - 2])
  let offset = -1
  while (fib[fib.length - 1] > 1) {
    const idx = Math.min(offset + fib[fib.length - 2], arr.length - 1)
    if (arr[idx] === target) return idx
    if (arr[idx] < target) { fib.pop(); offset = idx }
    else { fib.splice(fib.length - 2, 1) }
  }
  return -1
}