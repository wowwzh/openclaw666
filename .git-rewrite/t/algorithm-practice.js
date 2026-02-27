// 算法练习 - 2026-02-21
// 题目：反转链表

class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

// 方法1：迭代（推荐）
function reverseList(head) {
  let prev = null;
  let curr = head;
  
  while (curr !== null) {
    const nextTemp = curr.next; // 保存下一个节点
    curr.next = prev;           // 反转指针
    prev = curr;                // prev前移
    curr = nextTemp;           // curr前移
  }
  
  return prev;
}

// 方法2：递归
function reverseListRecursive(head, prev = null) {
  if (head === null) return prev;
  
  const next = head.next;
  head.next = prev;
  return reverseListRecursive(next, head);
}

// 测试
const list = new ListNode(1, 
  new ListNode(2, 
    new ListNode(3, 
      new ListNode(4, null))));

console.log("原链表: 1 -> 2 -> 3 -> 4");
const reversed = reverseList(list);
console.log("反转后: ", reversed); // 4 -> 3 -> 2 -> 1
