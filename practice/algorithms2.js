// 算法练习 - 追加

// 4. 整数反转 (简单)
function reverse(x) {
  const INT_MAX = 2147483647;
  const INT_MIN = -2147483648;
  
  let sign = x < 0 ? -1 : 1;
  let num = Math.abs(x);
  let reversed = 0;
  
  while (num > 0) {
    const digit = num % 10;
    num = Math.floor(num / 10);
    
    // 检查溢出
    if (reversed > Math.floor(INT_MAX / 10) || 
        (reversed === Math.floor(INT_MAX / 10) && digit > 7)) {
      return 0;
    }
    reversed = reversed * 10 + digit;
  }
  
  return sign * reversed;
}

console.log('=== 算法4: 整数反转 ===');
console.log('输入: x=123');
console.log('输出:', reverse(123));
console.log('输入: x=-123');
console.log('输出:', reverse(-123));
console.log('');

// 5. 有效的括号 (简单)
function isValid(s) {
  const stack = [];
  const map = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}

console.log('=== 算法5: 有效的括号 ===');
console.log('输入: s="()"');
console.log('输出:', isValid("()"));
console.log('输入: s="()[]{}"');
console.log('输出:', isValid("()[]{}"));
console.log('输入: s="(]"');
console.log('输出:', isValid("(]"));

console.log('✅ 追加算法练习完成 (2/2)');
