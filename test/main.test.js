import { run } from "../src/main";

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
    expect(run(`let empty = null; empty`)).toEqual(null);
  });

  test("赋值", () => {
    expect(run(`let x = 1;x = 2;`)).toEqual(2);
    expect(run(`let x = 1;x += 1; x`)).toEqual(2);
    expect(run(`let x = 1;x -= 1; x`)).toEqual(0);
    expect(run(`let x = 1;x *= 2; x`)).toEqual(2);
    expect(run(`let x = 1;x /= 2; x`)).toEqual(0.5);
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
