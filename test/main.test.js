import { run } from "../src/main";

describe("注释", () => {
  test("单行注释", () => {
    expect(
      run(`
      let x = 10; // 这是注释
      x
    `)
    ).toEqual(10);
  });

  test("多行注释", () => {
    expect(
      run(`
      let y = 20;
      /* 这是多行
        注释内容 */
      y
    `)
    ).toEqual(20);
  });

  test("混合注释", () => {
    expect(
      run(`
      // 开始计算
      let a = 5;
      /* 中间注释 */ let b = 10;
      // 结束计算
      a + b
    `)
    ).toEqual(15);
  });

  test("注释中包含特殊字符", () => {
    expect(
      run(`
      let z = 30;
      // 注释中包含 "引号" 和 '单引号'
      z
    `)
    ).toEqual(30);
  });
});

describe("变量", () => {
  test("字符串-双引号", () => {
    expect(run(`let name = "hello"; name`)).toEqual("hello");
  });

  test("字符串-单引号", () => {
    expect(run(`let name = 'world'; name`)).toEqual("world");
  });

  test("数字-正整数", () => {
    expect(run(`let num = 1; num`)).toEqual(1);
  });

  test("数字-负整数", () => {
    expect(run(`let num = -1; num`)).toEqual(-1);
  });

  test("数字-正小数", () => {
    expect(run(`let num = 1.2; num`)).toEqual(1.2);
  });

  test("数字-负小数", () => {
    expect(run(`let num = -1.2; num`)).toEqual(-1.2);
  });

  test("布尔-true", () => {
    expect(run(`let flag = true; flag`)).toEqual(true);
  });

  test("布尔-false", () => {
    expect(run(`let flag = false; flag`)).toEqual(false);
  });

  test("空-未初始化", () => {
    expect(run(`let empty; empty`)).toEqual(null);
  });

  test("空-null初始化", () => {
    expect(run(`let empty = null; empty`)).toEqual(null);
  });

  test("空-变量传递", () => {
    expect(run(`let y; let z = y; z`)).toEqual(null);
  });

  test("空-多个变量声明", () => {
    expect(run(`let a,b,c; a`)).toEqual(null);
  });

  test("空-多个变量声明和赋值", () => {
    expect(run(`let a,b,c = 1,2,3; a`)).toEqual(1);
  });

  test("空-部分变量赋值", () => {
    expect(run(`let a,b,c = 1,2; c`)).toEqual(null);
  });

  test("赋值-基本赋值", () => {
    expect(run(`let x = 1;x = 2;`)).toEqual(2);
  });

  test("赋值-加等于", () => {
    expect(run(`let x = 1;x += 1; x`)).toEqual(2);
  });

  test("赋值-减等于", () => {
    expect(run(`let x = 1;x -= 1; x`)).toEqual(0);
  });

  test("赋值-乘等于", () => {
    expect(run(`let x = 1;x *= 2; x`)).toEqual(2);
  });

  test("赋值-除等于", () => {
    expect(run(`let x = 1;x /= 2; x`)).toEqual(0.5);
  });
});

describe("常量", () => {
  test("常量-未初始化", () => {
    expect(run(`const x; x`)).toEqual(null);
  });

  test("常量-初始化", () => {
    expect(run(`const x = 42; x`)).toEqual(42);
  });

  test("常量-重新赋值抛出异常", () => {
    expect(() => run(`const x = "hello"; x = "world"`)).toThrow(
      "Assignment to constant variable 'x'"
    );
  });
});

describe("基本运算测试", () => {
  test("加法运算", () => {
    expect(run(`1 + 2`)).toEqual(3);
  });

  test("加减混合运算", () => {
    expect(run(`1 + 2 - 3`)).toEqual(0);
  });

  test("乘除混合运算", () => {
    expect(run(`4 * 2 / 2`)).toEqual(4);
  });

  test("运算优先级-乘法优先", () => {
    expect(run(`1 + 2 * 3`)).toEqual(7);
  });

  test("运算优先级-括号优先", () => {
    expect(run(`(1 + 2) * 3`)).toEqual(9);
  });

  test("复杂括号运算", () => {
    expect(run(`( 2 * 2 ) + ( 3 * 4 )`)).toEqual(16);
  });

  test("字符串连接", () => {
    expect(run(`"hello" + "world"`)).toEqual("helloworld");
  });

  test("字符串减法", () => {
    expect(run(`"hello" - "world"`)).toEqual(NaN);
  });

  test("正数除零-无穷大", () => {
    expect(run(`2 / 0`)).toEqual(Infinity);
  });

  test("负数除零-负无穷大", () => {
    expect(run(`-2 / 0`)).toEqual(-Infinity);
  });

  test("零除零-NaN", () => {
    expect(run(`0 / 0`)).toEqual(NaN);
  });
});

describe("递增递减", () => {
  test("前置和后置递增递减", () => {
    expect(
      run(`
      let x = 5;
      let a = ++x; // 前置递增
      let y = 5;
      let b = y++; // 后置递增
      
      let z = 5;
      let c = --z; // 前置递减
      let w = 5;
      let d = w--; // 后置递减
      
      [a, b, c, d, x, y, z, w]
    `)
    ).toEqual([6, 5, 4, 5, 6, 6, 4, 4]);
  });

  test("数组和对象属性递增递减", () => {
    expect(
      run(`
      let arr = [1, 2, 3];
      let obj = { count: 10 };
      
      arr[0]++;     // arr[0] 从 1 变为 2，返回 1
      ++arr[1];     // arr[1] 从 2 变为 3，返回 3
      
      obj.count--;  // obj.count 从 10 变为 9，返回 10
      --obj.value;  // obj.value 从 undefined 变为 NaN，返回 NaN
      
      [arr[0], arr[1], obj.count, obj.value]
    `)
    ).toEqual([2, 3, 9, NaN]);
  });
});

describe("逻辑运算符", () => {
  test("等于-不同类型比较", () => {
    expect(run(`2==1`)).toEqual(false);
  });

  test("等于-相同类型比较", () => {
    expect(run(`2==2`)).toEqual(true);
  });

  test("等于-字符串与数字比较", () => {
    expect(run(`'2'==2`)).toEqual(true);
  });

  test("等于-布尔与数字比较", () => {
    expect(run(`true==1`)).toEqual(true);
  });

  test("等于-布尔与零比较", () => {
    expect(run(`false==0`)).toEqual(true);
  });

  test("全等-严格相等", () => {
    expect(run(`'2'===2`)).toEqual(false);
  });

  test("不等于", () => {
    expect(run(`2 != 1`)).toEqual(true);
  });

  test("不全等", () => {
    expect(run(`2 !== 1`)).toEqual(true);
  });

  test("大于比较", () => {
    expect(run(`2 > 1`)).toEqual(true);
  });

  test("小于比较", () => {
    expect(run(`2 < 1`)).toEqual(false);
  });

  test("小于等于比较", () => {
    expect(run(`2 <= 2`)).toEqual(true);
  });

  test("大于等于比较", () => {
    expect(run(`2 >= 2`)).toEqual(true);
  });

  test("大于等于-大于情况", () => {
    expect(run(`4 >= 2`)).toEqual(true);
  });

  test("小于等于-小于情况", () => {
    expect(run(`4 <= 2`)).toEqual(false);
  });

  test("逻辑与", () => {
    expect(run(`true && false`)).toEqual(false);
  });

  test("逻辑或", () => {
    expect(run(`true || false`)).toEqual(true);
  });
});

describe("条件", () => {
  test("基本if语句", () => {
    expect(
      run(`
  let x = 1
  let r
  if (x == 1) { r = true }
  r
`)
    ).toEqual(true);
  });

  test("if-else语句", () => {
    expect(
      run(`
  let x = 2
  let r
  if (x == 1) { r = true } else { r = false }
  r
`)
    ).toEqual(false);
  });

  test("嵌套if语句", () => {
    expect(
      run(`
  let x = 1
  let y = 2
  let r
  if (x == 1) {
    if (y == 2) {
      r = true
    } else {
      r = false
    }
  }
  r
`)
    ).toEqual(true);
  });

  test("单行if语句", () => {
    expect(
      run(`
  let x = 1
  let r
  if (x == 1) r = true
  r
`)
    ).toEqual(true);
  });

  test("switch语句-匹配case", () => {
    expect(
      run(`
let x = 2;
let result = 0;
switch (x) {
  case 1:
    result = 10;
    break;
  case 2:
    result = 20;
    break;
  default:
    result = 0;
}
result;
`)
    ).toEqual(20);
  });

  test("switch语句-无break贯穿执行", () => {
    expect(
      run(`
let x = 1;
let result = 0;
switch (x) {
  case 1:
    result += 10;
  case 2:
    result += 20;
    break;
  default:
    result = 0;
}
result;
`)
    ).toEqual(30);
  });

  test("switch语句-default分支", () => {
    expect(
      run(`
let x = 99;
let result = 0;
switch (x) {
  case 1:
    result = 10;
    break;
  case 2:
    result = 20;
    break;
  default:
    result = 42;
}
result;
`)
    ).toEqual(42);
  });
});

describe("while循环", () => {
  test("基本while循环", () => {
    expect(
      run(`
    let i = 0;
    let sum = 0;
    while (i < 5) {
      sum = sum + i;
      i = i + 1;
    }
    sum
  `)
    ).toEqual(10);
  });

  test("单语句while循环体", () => {
    expect(
      run(`
      let x = 0;
      while (x < 3) x = x + 1;
      x
    `)
    ).toEqual(3);
  });

  test("while循环与函数结合", () => {
    expect(
      run(`
      function sumToN(n) {
        let i = 1;
        let sum = 0;
        while (i <= n) {
          sum = sum + i;
          i = i + 1;
        }
        return sum;
      }
      sumToN(4)
    `)
    ).toEqual(10);
  });

  test("while循环条件为false不执行", () => {
    expect(
      run(`
      let x = 0;
      while (false) {
        x = x + 1;
      }
      x
    `)
    ).toEqual(0);
  });
});

describe("for循环", () => {
  test("基本for循环", () => {
    expect(
      run(`
    let sum = 0;
    for (let i = 0; i < 3; i = i + 1) {
      sum = sum + i;
    }
    sum
  `)
    ).toBe(3);
  });

  test("for循环continue语句", () => {
    expect(
      run(`
    let count = 0;
    for (let i = 0; i < 5; i = i + 1) {
      if (i === 2) {
        continue;
      }
      count = count + 1;
    }
    count
  `)
    ).toBe(4);
  });

  test("for循环break语句", () => {
    expect(
      run(`
    let count = 0;
    for (let i = 0; i < 5; i = i + 1) {
      if (i === 3) {
        break;
      }
      count = count + 1;
    }
    count
  `)
    ).toBe(3);
  });

  test("嵌套for循环", () => {
    expect(
      run(`
    let sum = 0;
    for (let i = 0; i < 2; i = i + 1) {
      for (let j = 0; j < 3; j = j + 1) {
        sum = sum + 1;
      }
    }
    sum
  `)
    ).toBe(6);
  });
});

describe("do while循环", () => {
  test("基本do-while循环", () => {
    expect(
      run(`
    let i = 0;
    let sum = 0;
    do {
      sum = sum + i;
      i = i + 1;
    } while (i < 3);
    sum
  `)
    ).toBe(3);
  });

  test("do-while循环至少执行一次", () => {
    expect(
      run(`
    let i = 5;
    let count = 0;
    do {
      count = count + 1;
      i = i + 1;
    } while (i < 3);
    count
  `)
    ).toBe(1);
  });

  test("do-while循环break语句", () => {
    expect(
      run(`
    let i = 0;
    let count = 0;
    do {
      if (i === 2) {
        break;
      }
      count = count + 1;
      i = i + 1;
    } while (i < 5);
    count
  `)
    ).toBe(2);
  });

  test("do-while循环continue语句", () => {
    expect(
      run(`
    let i = 0;
    let count = 0;
    do {
      i = i + 1;
      if (i === 2) {
        continue;
      }
      count = count + 1;
    } while (i < 4);
    count
  `)
    ).toBe(3);
  });

  test("嵌套do-while循环", () => {
    expect(
      run(`
    let i = 0;
    let total = 0;
    do {
      let j = 0;
      do {
        total = total + 1;
        j = j + 1;
      } while (j < 2);
      i = i + 1;
    } while (i < 3);
    total
  `)
    ).toBe(6);
  });

  test("单语句do-while循环体", () => {
    expect(
      run(`
    let i = 0;
    do
      i = i + 1;
    while (i < 3);
    i
  `)
    ).toBe(3);
  });

  test("do-while循环复杂条件", () => {
    expect(
      run(`
    let x = 1;
    let y = 10;
    do {
      x = x + 1;
      y = y - 1;
    } while (x < 5 && y > 5);
    x + y
  `)
    ).toBe(11);
  });
});

describe("退出循环", () => {
  test("while循环break语句", () => {
    expect(
      run(`
      let i = 0;
      let sum = 0;
      while (i < 10) {
        if (i >= 3) {
          break;
        }
        sum = sum + i;
        i = i + 1;
      }
      sum
    `)
    ).toBe(3);
  });

  test("while循环continue语句", () => {
    expect(
      run(`
      let i = 0;
      let sum = 0;
      while (i < 5) {
        i = i + 1;
        if (i === 3) {
          continue;
        }
        sum = sum + i;
      }
      sum
    `)
    ).toBe(12);
  });

  test("嵌套循环break语句", () => {
    expect(
      run(`
      let i = 0;
      let result = 0;
      while (i < 3) {
        let j = 0;
        while (j < 5) {
          if (j >= 2) {
            break;
          }
          result = result + 1;
          j = j + 1;
        }
        i = i + 1;
      }
      result
    `)
    ).toBe(6);
  });

  test("嵌套循环continue语句", () => {
    expect(
      run(`
      let i = 0;
      let result = 0;
      while (i < 2) {
        let j = 0;
        while (j < 4) {
          j = j + 1;
          if (j === 2) {
            continue;
          }
          result = result + 1;
        }
        i = i + 1;
      }
      result
    `)
    ).toBe(6);
  });

  test("无限循环break语句", () => {
    expect(
      run(`
      let i = 0;
      let sum = 0;
      while (true) {
        sum = sum + i;
        i = i + 1;
        if (sum >= 10) {
          break;
        }
      }
      sum
    `)
    ).toBe(10);
  });

  test("多重条件continue语句", () => {
    expect(
      run(`
      let i = 0;
      let sum = 0;
      while (i < 10) {
        i = i + 1;
        if (i % 2 === 0) {
          continue;
        }
        if (i > 7) {
          continue;
        }
        sum = sum + i;
      }
      sum
    `)
    ).toBe(16);
  });

  test("多重条件break和continue混合", () => {
    expect(
      run(`
      let i = 0;
      let sum = 0;
      while (i < 10) {
        i = i + 1;
        if (i % 3 === 0) {
          continue;
        }
        if (i > 8) {
          break;
        }
        sum = sum + i;
      }
      sum
    `)
    ).toBe(27);
  });

  test("简单break语句", () => {
    expect(
      run(`
      let x = 0;
      while (x < 5) {
        x = x + 1;
        break;
      }
      x
    `)
    ).toBe(1);
  });

  test("continue语句计数", () => {
    expect(
      run(`
      let count = 0;
      let i = 0;
      while (i < 3) {
        i = i + 1;
        if (i === 2) {
          continue;
        }
        count = count + 1;
      }
      count
    `)
    ).toBe(2);
  });
});

describe("函数测试", () => {
  test("函数定义和调用", () => {
    const code = `
            function add(a,b){
                return (a + b) * a
            }
            add(10,20)
            `;
    expect(run(code)).toEqual(300);
  });
});

describe("异常捕获", () => {
  test("基础try-catch", () => {
    expect(
      run(`
let result = 0;
try {
  const x;
  x = 1
} catch (error) {
  result = 42;
}
result;
`)
    ).toEqual(42);
  });

  test("无错误情况", () => {
    expect(
      run(`
let result = 0;
try {
  result = 100;
} catch (error) {
  result = 0;
}
result;
`)
    ).toEqual(100);
  });

  test("try-catch-finally", () => {
    expect(
      run(`
let result = 0;
try {
  result = 1;
  throw "Something went wrong";
} catch (error) {
  result = 2;
} finally {
  result = 3;
}
result;
`)
    ).toEqual(3);
  });

  test("只有finally", () => {
    expect(
      run(`
let result = 0;
try {
  result = 1;
} finally {
  result = 2;
}
result;
`)
    ).toEqual(2);
  });

  test("抛出自定义错误并捕获", () => {
    expect(
      run(`
let result = "";
try {
  throw "Custom Error";
} catch (error) {
  result = error;
}
result;
`)
    ).toEqual("Custom Error");
  });

  test("无catch只有finally且抛出错误", () => {
    expect(() =>
      run(`
try {
  throw "Unhandled Error";
} finally {
  let x = 1;
}
`)
    ).toThrow();
  });
});

describe("数组对象", () => {
  test("数组字面量", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr
  `)
    ).toEqual([1, 2, 3]);
  });

  test("空数组", () => {
    expect(
      run(`
    let arr = [];
    arr.length
  `)
    ).toBe(0);
  });

  test("混合类型数组", () => {
    expect(
      run(`
    let arr = [1, "hello", true, null];
    arr
  `)
    ).toEqual([1, "hello", true, null]);
  });

  test("对象字面量", () => {
    const result = run(`
    let obj = { name: "Alice", age: 30 };
    obj
  `);
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  test("字符串键对象", () => {
    const result = run(`
    let obj = { name: "Bob", age: 25 };
    obj
  `);
    expect(result).toEqual({ name: "Bob", age: 25 });
  });

  test("空对象", () => {
    expect(
      run(`
    let obj = {};
    Object.keys(obj).length
  `)
    ).toBe(0);
  });

  test("数组元素访问", () => {
    expect(
      run(`
    let arr = [10, 20, 30];
    arr[1]
  `)
    ).toBe(20);
  });

  test("数组元素赋值", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr[1] = 99;
    arr[1]
  `)
    ).toBe(99);
  });

  test("对象属性访问", () => {
    expect(
      run(`
    let obj = { name: "Charlie", age: 35 };
    obj.name
  `)
    ).toBe("Charlie");
  });

  test("对象属性括号访问", () => {
    expect(
      run(`
    let obj = { name: "David", age: 40 };
    obj["name"]
  `)
    ).toBe("David");
  });

  test("对象属性赋值", () => {
    expect(
      run(`
    let obj = { name: "Eve" };
    obj.name = "Eve Updated";
    obj.name
  `)
    ).toBe("Eve Updated");
  });

  test("计算属性访问", () => {
    expect(
      run(`
    let arr = [100, 200, 300];
    let index = 2;
    arr[index]
  `)
    ).toBe(300);
  });

  test("嵌套数组和对象访问", () => {
    expect(
      run(`
    let data = {
      users: [
        { name: "Alice", scores: [85, 92, 78] },
        { name: "Bob", scores: [90, 88, 95] }
      ]
    };
    data.users[0].scores[1]
  `)
    ).toBe(92);
  });

  test("数组长度模拟", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr.length
  `)
    ).toBe(3);
  });

  test("修改数组长度", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr.length = 2;
    arr
  `)
    ).toEqual([1, 2]);
  });

  test("对象包含数组属性", () => {
    const result = run(`
    let obj = {
      items: [1, 2, 3],
      count: 3
    };
    obj
  `);
    expect(result).toEqual({ items: [1, 2, 3], count: 3 });
  });
});

describe("for in", () => {
  test("for-in循环", () => {
    expect(
      run(`
      let obj = { a: 1, b: 2, c: 3 };
      let keys = [];
      for (let key in obj) {
        let b = 10
        keys.push(key);
      }
      keys
    `)
    ).toEqual(["a", "b", "c"]);
  });

  test("for-of循环", () => {
    expect(
      run(`
      let arr = [1, 2, 3];
      let values = [];
      for (let value of arr) {
        values.push(value);
      }
      values
    `)
    ).toEqual([1, 2, 3]);
  });

  test("for-in循环求和", () => {
    expect(
      run(`
      let obj = { a: 1, b: 2, c: 3 };
      let sum1 = 0;
      for (let key in obj) {
        sum1 += obj[key];
      }
      sum1
    `)
    ).toBe(6);
  });

  test("for-in和for-of循环break和continue", () => {
    expect(
      run(`
      let obj = { a: 1, b: 2, c: 3 };
      let sum = 0;
      
      // for...in 循环
      for (let key in obj) {
        if (key === "b") continue;
        console.log(sum) // 一直是 0，不知道为啥
        sum += obj[key];
        if (key === "c") break;
      }
      
      let arr = [10, 20, 30];
      // for...of 循环
      for (let value of arr) {
        if (value === 20) continue;
        sum += value;
        if (value === 30) break;
      }
      
      sum
    `)
    ).toBe(44);
  });
});

describe("作用域", () => {
  test("局部变量不泄漏到全局作用域", () => {
    expect(
      run(`
      let a = 1;
      function f() {
        let a = 2;
      }
      f();
      a;
    `)
    ).toEqual(1);
  });

  test("内部函数访问外部作用域", () => {
    expect(
      run(`
      let x = 10;
      function outer() {
        function inner() {
          return x;
        }
        return inner();
      }
      outer();
    `)
    ).toEqual(10);
  });

  test("嵌套作用域变量遮蔽", () => {
    expect(
      run(`
      let a = 1;
      function test() {
        let a = 2;
        return a;
      }
      test();
    `)
    ).toEqual(2);
  });

  test("函数参数局部作用域", () => {
    expect(
      run(`
      let x = 100;
      function foo(x) {
        return x;
      }
      foo(50);
    `)
    ).toEqual(50);
  });

  test("const变量不可重新赋值", () => {
    expect(() =>
      run(`
      const x = 1;
      x = 2;
    `)
    ).toThrow("Assignment to constant variable 'x'");
  });
});