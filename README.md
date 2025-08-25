# 🚀 TINY-JS Language Interpreter

一个简化版的 JavaScript 解释器实现，用于学习和理解编程语言解释执行的基本原理。

> 🧠 本项目专注于语法解析与运行时逻辑的模拟，并非完整的 JavaScript 引擎，而是对核心特性的精简实现。

---

## ✨ 特性概览

- 支持基本数据类型（字符串、数字、布尔值、null）
- 完整的变量与常量声明机制（`var` / `const`）
- 基本表达式运算（加减乘除、括号优先级、字符串拼接等）
- 控制流语句支持（if/else, switch, while, do-while, for, for-in, for-of）
- 函数定义与调用
- 错误处理机制（try/catch/finally）
- 数组与对象字面量及属性访问
- 作用域链模拟（局部作用域、嵌套作用域）

---

## 🧪 测试覆盖

本解释器通过大量单元测试验证功能正确性，涵盖以下主要模块：

### 注释
- 单行注释
- 多行注释
- 混合使用
- 含特殊字符的注释

### 变量与赋值
- 字符串（单引号/双引号）
- 正负整数/小数
- 布尔值（true/false）
- null 与未初始化变量
- 赋值操作符（+=, -=, *=, /=）

### 常量
- const 声明
- 不可重新赋值检测

### 表达式与运算
- 四则运算
- 括号优先级
- 类型转换（如 `"1" + 2`）
- 特殊值处理（NaN, Infinity）

### 递增递减
- 前置与后置自增/自减
- 成员属性递增递减

### 逻辑运算符
- == / === / != / !==
- < / > / <= / >=
- && / ||

### 条件控制
- if / else
- switch-case-default
- 嵌套条件语句

### 循环结构
- while / do-while / for
- break / continue
- for-in / for-of 遍历数组与对象

### 异常处理
- try / catch / finally
- 自定义错误抛出与捕获

### 数据结构
- 数组与对象字面量
- 属性访问（点号、中括号）
- 嵌套结构支持
- length 属性模拟

### 作用域
- 局部变量不污染全局
- 嵌套作用域查找
- 参数作用域隔离
- const 不可变性

---

## 🔧 使用方式

你可以克隆该项目并在 Node.js 环境下运行测试或直接解析代码片段：

```bash
git clone https://github.com/leyen-me/tinyjs.git
cd tinyjs
npm install
npm test
```

或者在代码中引入解释器进行测试：

```js
const interpreter = require('./interpreter');

interpreter.run(`
  var a = 5;
  const b = 'Hello';
  console.log(a + b); // 输出: 5Hello
`);
```

---

## 📦 技术栈

- **语言**: JavaScript (Node.js)
- **测试框架**: Jest
- **解析方式**: 手动词法分析 + 递归下降语法分析
- **目标**: 教学与实验用途

---

## 📚 学习价值

本项目适合作为以下学习场景的参考：

- 编译原理入门实践
- 解释器设计模式理解
- JavaScript 运行机制探索
- AST 构建与求值过程演示

---

## 🤝 贡献

欢迎提交 issue 和 pull request！  
你可以帮助添加更多 JavaScript 特性、优化性能或完善文档。

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.

---

## 💬 联系我

如有问题或建议，请联系 [672228275@qq.com](mailto:672228275@qq.com) 或提交 GitHub Issue。