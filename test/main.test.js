import { run } from "../src/main";

describe("基本运算测试", () => {
  test("正常加减", () => {
    code = `1 + 2`;
    expect(run(code)).toEqual(3);
  });

  test("连续加减", () => {
    code = `1 + 2 - 3`;
    expect(run(code)).toEqual(0);
  });

  test("正常乘除", () => {
    code = `4 * 2 / 2`;
    expect(run(code)).toEqual(4);
  });

  test("优先级运算", () => {
    code = `1 + 2 * 3`;
    expect(run(code)).toEqual(7);
  });

  test("优先级运算", () => {
    code = `(1 + 2) * 3`;
    expect(run(code)).toEqual(9);
  });

  test("优先级运算", () => {
    code = `( 2 * 2 ) + ( 3 * 4 )`; // 4 + 12
    expect(run(code)).toEqual(16);
  });
});

describe("函数测试", () => {
  test("函数", () => {
    code = `
            function add(a,b){
                return (a + b) * a
            }
            add(10,20)
            `;
    expect(run(code)).toEqual(300);
  });
});
