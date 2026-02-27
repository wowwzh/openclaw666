// 算法练习 - 2026-02-25

// 1. 两数之和 (简单)
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}

console.log('=== 算法1: 两数之和 ===');
console.log('输入: nums=[2,7,11,15], target=9');
console.log('输出:', JSON.stringify(twoSum([2,7,11,15], 9)));
console.log('复杂度: O(n)时间, O(n)空间\n');

// 2. 无重复字符的最长子串 (中等)
function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let start = 0, maxLen = 0;
  
  for (let end = 0; end < s.length; end++) {
    if (seen.has(s[end]) && seen.get(s[end]) >= start) {
      start = seen.get(s[end]) + 1;
    }
    seen.set(s[end], end);
    maxLen = Math.max(maxLen, end - start + 1);
  }
  return maxLen;
}

console.log('=== 算法2: 无重复字符的最长子串 ===');
console.log('输入: s="abcabcbb"');
console.log('输出:', lengthOfLongestSubstring("abcabcbb"));
console.log('解释: "abc"最长,长度3\n');

// 3. 最长回文子串 (中等)
function longestPalindrome(s) {
  if (!s || s.length < 2) return s;
  
  let start = 0, maxLen = 1;
  
  function expand(l, r) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      if (r - l + 1 > maxLen) {
        start = l;
        maxLen = r - l + 1;
      }
      l--; r++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expand(i, i);     // 奇数长度
    expand(i, i + 1); // 偶数长度
  }
  
  return s.substring(start, start + maxLen);
}

console.log('=== 算法3: 最长回文子串 ===');
console.log('输入: s="babad"');
console.log('输出:', longestPalindrome("babad"));
console.log('解释: "bab"或"ada"都是最长回文\n');

console.log('✅ 今日算法练习完成 (3/3)');
