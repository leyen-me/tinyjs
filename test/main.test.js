import { run } from "../src/main";

describe("注释", () => {
  test("单行注释和多行注释", () => {
    expect(
      run(`
      let x = 10; // 这是注释
      x
    `)
    ).toEqual(10);

    expect(
      run(`
      let y = 20;
      /* 这是多行
        注释内容 */
      y
    `)
    ).toEqual(20);

    // 测试混合注释
    expect(
      run(`
      // 开始计算
      let a = 5;
      /* 中间注释 */ let b = 10;
      // 结束计算
      a + b
    `)
    ).toEqual(15);

    // 测试注释中包含特殊字符
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
  test("字符串", () => {
    expect(run(`let name = "hello"; name`)).toEqual("hello");
    expect(run(`let name = 'world'; name`)).toEqual("world");
  });

  test("数字", () => {
    expect(run(`let num = 1; num`)).toEqual(1);
    expect(run(`let num = -1; num`)).toEqual(-1);
    expect(run(`let num = 1.2; num`)).toEqual(1.2);
    expect(run(`let num = -1.2; num`)).toEqual(-1.2);
  });

  test("布尔", () => {
    expect(run(`let flag = true; flag`)).toEqual(true);
    expect(run(`let flag = false; flag`)).toEqual(false);
  });

  test("空", () => {
    expect(run(`let empty; empty`)).toEqual(null);
    expect(run(`let empty = null; empty`)).toEqual(null);
    expect(run(`let y; let z = y; z`)).toEqual(null);
    expect(run(`let a,b,c; a`)).toEqual(null);
    expect(run(`let a,b,c = 1,2,3; a`)).toEqual(1);
    expect(run(`let a,b,c = 1,2; c`)).toEqual(null);
  });

  test("赋值", () => {
    expect(run(`let x = 1;x = 2;`)).toEqual(2);
    expect(run(`let x = 1;x += 1; x`)).toEqual(2);
    expect(run(`let x = 1;x -= 1; x`)).toEqual(0);
    expect(run(`let x = 1;x *= 2; x`)).toEqual(2);
    expect(run(`let x = 1;x /= 2; x`)).toEqual(0.5);
  });
});

describe("常量", () => {
  test("常量", () => {
    expect(run(`const x; x`)).toEqual(null);
    expect(run(`const x = 42; x`)).toEqual(42);
    expect(() => run(`const x = "hello"; x = "world"`)).toThrow(
      "Assignment to constant variable 'x'"
    );
  });
});

describe("基本运算测试", () => {
  test("正常加减", () => {
    expect(run(`1 + 2`)).toEqual(3);
    expect(run(`1 + 2 - 3`)).toEqual(0);
    expect(run(`4 * 2 / 2`)).toEqual(4);
    expect(run(`1 + 2 * 3`)).toEqual(7);
    expect(run(`(1 + 2) * 3`)).toEqual(9);
    expect(run(`( 2 * 2 ) + ( 3 * 4 )`)).toEqual(16);
    expect(run(`"hello" + "world"`)).toEqual("helloworld");
    expect(run(`"hello" - "world"`)).toEqual(NaN);

    expect(run(`2 / 0`)).toEqual(Infinity); // 无穷大
    expect(run(`-2 / 0`)).toEqual(-Infinity);
    expect(run(`0 / 0`)).toEqual(NaN);
  });
});

describe("递增递减", () => {
  test("increment and decrement operators", () => {
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

  test("increment and decrement array and object properties", () => {
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
  test("等于", () => {
    expect(run(`2==1`)).toEqual(false);
    expect(run(`2==2`)).toEqual(true);
    expect(run(`'2'==2`)).toEqual(true);
    expect(run(`true==1`)).toEqual(true);
    expect(run(`false==0`)).toEqual(true);
    expect(run(`'2'===2`)).toEqual(false);
  });

  test("不等于", () => {
    expect(run(`2 != 1`)).toEqual(true);
    expect(run(`2 !== 1`)).toEqual(true);
  });

  test("大于小于", () => {
    expect(run(`2 > 1`)).toEqual(true);
    expect(run(`2 < 1`)).toEqual(false);
    expect(run(`2 <= 2`)).toEqual(true);
    expect(run(`2 >= 2`)).toEqual(true);
    expect(run(`4 >= 2`)).toEqual(true);
    expect(run(`4 <= 2`)).toEqual(false);
  });

  test("逻辑运算", () => {
    expect(run(`true && false`)).toEqual(false);
    expect(run(`true || false`)).toEqual(true);
  });
});

describe("条件", () => {
  test("如果", () => {
    // 基本 if 语句
    expect(
      run(`
  let x = 1
  let r
  if (x == 1) { r = true }
  r
`)
    ).toEqual(true);

    // if-else 语句
    expect(
      run(`
  let x = 2
  let r
  if (x == 1) { r = true } else { r = false }
  r
`)
    ).toEqual(false);

    // 嵌套 if 语句
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

    expect(
      run(`
  let x = 1
  let r
  if (x == 1) r = true
  r
`)
    ).toEqual(true);

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
  ).toEqual(10); // 0+1+2+3+4 = 10

  // 单语句循环体
  expect(
    run(`
      let x = 0;
      while (x < 3) x = x + 1;
      x
    `)
  ).toEqual(3);

  // 嵌套循环
  expect(
    run(`
      let i = 0;
      let total = 0;
      while (i < 2) {
        let j = 0;
        while (j < 3) {
          total = total + 1;
          j = j + 1;
        }
        i = i + 1;
      }
      total
    `)
  ).toEqual(6);

  // while 循环与函数结合
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
  ).toEqual(10); // 1+2+3+4 = 10

  // false 条件不执行循环
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

describe("for循环", () => {
  test("basic for loop", () => {
    expect(
      run(`
    let sum = 0;
    for (let i = 0; i < 3; i = i + 1) {
      sum = sum + i;
    }
    sum
  `)
    ).toBe(3); // 0 + 1 + 2 = 3
  });

  test("for loop with continue", () => {
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

  test("for loop with break", () => {
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

  test("nested for loop", () => {
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
  test("basic do-while loop", () => {
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
    ).toBe(3); // 0 + 1 + 2 = 3
  });

  test("do-while loop executes at least once", () => {
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
    ).toBe(1); // 即使条件一开始就不满足，也会执行一次
  });

  test("do-while loop with break", () => {
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

  test("do-while loop with continue", () => {
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

  test("nested do-while loops", () => {
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
    ).toBe(6); // 3 * 2 = 6
  });

  test("do-while with single statement body", () => {
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

  test("do-while loop with complex condition", () => {
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
    ).toBe(11); // x=5, y=6, sum=11
  });
});

describe("退出循环", () => {
  test("退出循环", () => {
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
    ).toBe(3); // 0 + 1 + 2 = 3

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
    ).toBe(12); // 1 + 2 + 4 + 5 = 12 (跳过了3)

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
    ).toBe(6); // 每个内层循环执行2次，共3个外层循环

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
    ).toBe(6); // 每个内层循环执行3次(跳过j=2)，共2个外层循环

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
    ).toBe(10); // 0 + 1 + 2 + 3 + 4 = 10

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

    // test('break with early termination', () => {
    //   expect(run(`
    //     let arr = [1, 2, 3, 4, 5];
    //     let i = 0;
    //     let found = 0;
    //     while (i < 5) {
    //       if (arr[i] === 3) {
    //         found = arr[i];
    //         break;
    //       }
    //       i = i + 1;
    //     }
    //     found
    //   `)).toBe(3);
    // });
  });
});

describe("函数测试", () => {
  test("函数", () => {
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
  test("异常捕获", () => {
    // 测试用例 4：基础 try...catch
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

    // 测试用例 5：没有错误的情况
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

    // 测试用例 6：try...catch...finally
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

    // 测试用例 7：只有 finally
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

    // 测试用例 8：抛出自定义错误并捕获
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

    // 测试用例 9：没有 catch 只有 finally，且抛出错误
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
  test("array literal", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr
  `)
    ).toEqual([1, 2, 3]);
  });

  test("empty array", () => {
    expect(
      run(`
    let arr = [];
    arr.length
  `)
    ).toBe(0);
  });

  test("array with mixed types", () => {
    expect(
      run(`
    let arr = [1, "hello", true, null];
    arr
  `)
    ).toEqual([1, "hello", true, null]);
  });

  test("object literal", () => {
    const result = run(`
    let obj = { name: "Alice", age: 30 };
    obj
  `);
    expect(result).toEqual({ name: "Alice", age: 30 });
  });

  test("object with string keys", () => {
    const result = run(`
    let obj = { name: "Bob", age: 25 };
    obj
  `);
    expect(result).toEqual({ name: "Bob", age: 25 });
  });

  test("empty object", () => {
    expect(
      run(`
    let obj = {};
    Object.keys(obj).length
  `)
    ).toBe(0);
  });

  test("array element access", () => {
    expect(
      run(`
    let arr = [10, 20, 30];
    arr[1]
  `)
    ).toBe(20);
  });

  test("array element assignment", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr[1] = 99;
    arr[1]
  `)
    ).toBe(99);
  });

  test("object property access", () => {
    expect(
      run(`
    let obj = { name: "Charlie", age: 35 };
    obj.name
  `)
    ).toBe("Charlie");
  });

  test("object property access with bracket notation", () => {
    expect(
      run(`
    let obj = { name: "David", age: 40 };
    obj["name"]
  `)
    ).toBe("David");
  });

  test("object property assignment", () => {
    expect(
      run(`
    let obj = { name: "Eve" };
    obj.name = "Eve Updated";
    obj.name
  `)
    ).toBe("Eve Updated");
  });

  test("computed property access", () => {
    expect(
      run(`
    let arr = [100, 200, 300];
    let index = 2;
    arr[index]
  `)
    ).toBe(300);
  });

  test("nested array and object access", () => {
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

  test("array methods simulation", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr.length
  `)
    ).toBe(3);
  });

  test("modify array length", () => {
    expect(
      run(`
    let arr = [1, 2, 3];
    arr.length = 2;
    arr
  `)
    ).toEqual([1, 2]);
  });

  test("object with array property", () => {
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
  test("for in loop", () => {
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

  test("for of loop", () => {
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

  test("for in and for of loops with break and continue", () => {
    expect(
      run(`
      let obj = { a: 1, b: 2, c: 3 };
      let sum = 0;
      for (let key in obj) {
        sum += obj[key];
      }
      sum
    `)
    ).toBe(6);
  });

  test("for in and for of loops with break and continue", () => {
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
