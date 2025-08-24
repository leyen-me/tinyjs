// 目标：用 JS 实现一个 X 语言

// 新增：移除注释的函数
function removeComments(code) {
  let result = '';
  let i = 0;

  while (i < code.length) {
    // 检查是否是单行注释 //
    if (code[i] === '/' && code[i + 1] === '/') {
      // 跳过直到行尾
      while (i < code.length && code[i] !== '\n') {
        i++;
      }
      // 保留换行符（如果存在）
      if (i < code.length && code[i] === '\n') {
        result += '\n';
        i++;
      }
      continue;
    }

    // 检查是否是多行注释 /*
    if (code[i] === '/' && code[i + 1] === '*') {
      i += 2; // 跳过 /*
      // 跳过直到遇到 */
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
        i++;
      }
      i += 2; // 跳过 */
      continue;
    }

    // 普通字符
    result += code[i];
    i++;
  }

  return result;
}

// 辅助函数
function shouldReturnFromLoop(bodyNode, result) {
  if (result === undefined) return false;
  // 直接的 return 语句
  if (bodyNode.type === 'ReturnStatement') {
    return true;
  }
  // 块语句中的 return
  if (bodyNode.type === 'BlockStatement') {
    // 简单处理：如果结果不是基本类型，可能是 return
    return typeof result === 'object' && result !== null && result.type === 'ReturnStatement';
  }
  // 普通表达式结果不应该导致函数返回
  return false;
}

// 词法分析
function tokenize(code) {
  // 第一步：移除注释
  let cleanCode = removeComments(code);

  // 使用正则表达式匹配代码中的 token，如关键字、符号、标识符、数字等
  // 在词法分析阶段，通过正则表达式中的 \s* 来过滤空格和换行符
  // 定义各种 token 的正则模式
  const LITERALS = [
    `"([^"\\\\]|\\\\.)*"`, // 双引号字符串
    `'([^'\\\\]|\\\\.)*'`, // 单引号字符串
    `\\d+\\.?\\d*`, // 负数和正数和小数
    `true`, // 布尔值 true
    `false`, // 布尔值 false
  ];

  const KEYWORDS = [`function`, `return`, `let`, `const`, `if`,
    `else`, `while`, `break`, `continue`, `switch`,
    `case`, `default`, `null`, `try`, `catch`, `finally`, `throw`];

  // 注意：长的操作符要放在短的操作符前面！
  const OPERATORS = [
    // 三元操作符
    `=>`,
    `\\?`,
    `:`,

    // 比较操作符（长的在前）
    `===`,
    `!==`,
    `==`,
    `!=`,
    `<=`,
    `>=`,

    // 复合赋值操作符
    `\\+=`,
    `-=`,
    `\\*=`,
    `/=`,

    // 其他操作符
    `<`,
    `>`,
    `=`,
    `\\{`,
    `\\}`,
    `\\(`,
    `\\)`,
    `;`,
    `,`,
    `&&`,
    `\\|\\|`, // 逻辑操作符
    `\\+`,
    `-`,
    `\\*`,
    `\\/`,
    `%`
  ];

  const IDENTIFIERS = [
    `[A-Za-z_]\\w*`, // 标识符
  ];

  // 合并所有模式
  const ALL_PATTERNS = [...LITERALS, ...KEYWORDS, ...OPERATORS, ...IDENTIFIERS];
  const TOKEN_REGEX = new RegExp(`\\s*(${ALL_PATTERNS.join("|")})\\s*`, "g");

  // matchAll 匹配所有符合正则的内容，然后用 map 提取出匹配的 token（m[1] 是捕获组）
  let tokens = [...cleanCode.matchAll(TOKEN_REGEX)].map((m) => m[1]);
  tokens = tokens.filter((token) => token !== ";"); // js 对分号可有可无
  // console.log(tokens);

  return tokens;
}

// 语法分析
function parse(tokens) {
  let i = 0; // 当前解析的位置索引
  const peek = () => tokens[i]; // peek：查看当前 token，但不移动索引
  const next = () => tokens[i++]; // next：获取当前 token，并将索引前移

  // 解析基本表达式（数字、括号、标识符、函数调用等）
  function parsePrimary() {
    const t = next(); // 取出当前 token

    // 处理负数
    if (t === "-") {
      const numberToken = next();
      if (/^\d+\.?\d*$/.test(numberToken)) {
        return { type: "Literal", value: -Number(numberToken), raw: t };
      }
      // 如果不是数字，回退并当作二元运算符处理
      i -= 2; // 回退两个token
      return parseMultiplicative(); // 重新解析
    }

    // 字符串字面量
    if (
      (t.startsWith('"') && t.endsWith('"')) ||
      (t.startsWith("'") && t.endsWith("'"))
    ) {
      // 去掉引号并处理转义字符
      let value = t.slice(1, -1);
      // 简单的转义字符处理
      value = value
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");
      return { type: "Literal", value: value, raw: t };
    }

    if (t === "true") {
      return { type: "Literal", value: true, raw: t };
    }

    if (t === "false") {
      return { type: "Literal", value: false, raw: t };
    }

    if (t === "null") {
      return { type: "Literal", value: null, raw: t };
    }

    // 如果是数字
    if (/^\d+\.?\d*$/.test(t)) return { type: "Literal", value: +t }; // 转为数字字面量

    // 如果是左括号
    if (t === "(") {
      const e = parseExpression(); // 递归解析括号内的表达式
      next(); // 吃掉右括号 ")"
      return e; // 返回括号内的表达式
    }

    // 如果是标识符
    if (/^[A-Za-z_]\w*$/.test(t)) {
      let node = { type: "Identifier", name: t }; // 构造标识符节点
      let p = peek();
      switch (p) {
        // 如果标识符后面是左括号，说明是函数调用
        case "(":
          next(); // 吃掉 "("
          let args = []; // 参数列表
          while (peek() !== ")") {
            args.push(parseExpression()); // 添加参数
            if (peek() === ",") next(); // 如果有逗号，吃掉
          }
          next(); // 吃掉 ")"
          node = { type: "CallExpression", callee: node, arguments: args }; // 构造调用节点
          break;
        // 如果标识符后面是等号，说明是赋值
        case "=":
        case "+=":
        case "-=":
        case "*=":
        case "/=":
          next(); // 吃掉 "="/"+="...
          let expression = parseExpression(); // 赋值的表达式
          node = {
            type: "AssignmentExpression",
            operator: p,
            left: { type: "Identifier", name: t },
            right: expression,
          };
          break;
        default:
          break;
      }

      return node;
    }

    // 添加错误检查
    throw new Error(`Unexpected token: ${t}`);
  }

  // 解析乘除法（高优先级）
  function parseMultiplicative() {
    let left = parsePrimary();
    while (peek() === "*" || peek() === "/" || peek() === "%") {
      const op = next();
      const right = parsePrimary();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  // 解析加减法（低优先级）
  function parseAdditive() {
    let left = parseMultiplicative();
    while (peek() === "+" || peek() === "-") {
      const op = next();
      const right = parseMultiplicative();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  // 解析逻辑与运算
  function parseLogicalAnd() {
    let left = parseEquality();
    while (peek() === "&&") {
      const op = next();
      const right = parseEquality();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  // 解析相等性比较
  function parseEquality() {
    let left = parseRelational();
    while (["==", "===", "!=", "!=="].includes(peek())) {
      const op = next();
      const right = parseRelational();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  // 解析关系比较
  function parseRelational() {
    let left = parseAdditive();
    while (["<", ">", "<=", ">="].includes(peek())) {
      const op = next();
      const right = parseAdditive();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  // 解析逻辑与运算
  function parseLogicalOr() {
    let left = parseLogicalAnd();
    while (peek() === "||") {
      const op = next();
      const right = parseLogicalAnd();
      left = { type: "BinaryExpression", operator: op, left, right };
    }
    return left;
  }

  // 解析表达式入口
  const parseExpression = parseLogicalOr;

  // 解析语句（let、function、return、普通表达式等）
  function parseStatement() {
    let t = peek(); // 看当前 token
    // 分号过滤
    if (t === ";") {
      // 空语句
      next(); // 吃掉分号
      return { type: "EmptyStatement" };
    }
    // 变量声明
    if (t === "let" || t === "const") {
      const kind = next(); // 吃掉 "let" 或者 "const"

      const declarations = [];
      const names = [];

      // 先收集所有变量名
      while (true) {
        const name = next(); // 这里用 next() 而不是 peek() + next()
        if (!/^[A-Za-z_]\w*$/.test(name)) {
          throw new Error(`Invalid variable name: ${name}`);
        }
        names.push(name);

        // 如果下一个 token 是逗号，则继续读取变量名
        if (peek() === ",") {
          next(); // 吃掉 ","
        } else {
          break;
        }
      }

      // 检查是否有初始化部分
      if (peek() === "=") {
        next(); // 吃掉 "="

        // 收集所有初始化值
        const inits = [];
        while (true) {
          const init = parseExpression();
          inits.push(init);

          // 如果下一个 token 是逗号，则继续读取初始化值
          if (peek() === ",") {
            next(); // 吃掉 ","
          } else {
            break;
          }
        }

        // 构建声明列表
        for (let i = 0; i < names.length; i++) {
          const init =
            i < inits.length
              ? inits[i]
              : { type: "Literal", value: null, raw: "null" };
          declarations.push({ id: names[i], init });
        }
      } else {
        // 没有初始化部分，全部设为 null
        for (const name of names) {
          declarations.push({
            id: name,
            init: { type: "Literal", value: null, raw: "null" },
          });
        }
      }

      return {
        type: "VariableDeclarationList",
        kind,
        declarations,
      };
    }
    // 函数声明
    if (t === "function") {
      next(); // 吃掉 "function"
      let name = next(); // 函数名
      next(); // 吃掉 "("
      let params = []; // 参数列表
      while (peek() !== ")") {
        // 循环读取参数
        params.push(next()); // 添加参数
        if (peek() === ",") next(); // 吃掉逗号
      }
      next(); // 吃掉 ")"
      next(); // 吃掉 "{"
      let body = [];

      // 循环读取语句
      while (peek() !== "}") body.push(parseStatement());

      next(); // 吃掉 "}"
      return { type: "FunctionDeclaration", id: name, params, body };
    }
    // 返回值
    if (t === "return") {
      // 返回语句
      next(); // 吃掉 "return"
      let arg = parseExpression(); // 解析返回值
      return { type: "ReturnStatement", argument: arg }; // 返回返回语句节点
    }
    // 条件
    if (t === "if") {
      next(); // 吃掉 "if"
      next(); // 吃掉 "("
      const test = parseExpression(); // 解析条件表达式
      next(); // 吃掉 ")"

      // 解析 consequent（if 后面的语句块）
      let consequent;
      if (peek() === "{") {
        next(); // 吃掉 "{"
        const body = [];
        while (peek() !== "}") {
          body.push(parseStatement());
        }
        next(); // 吃掉 "}"
        consequent = { type: "BlockStatement", body };
      } else {
        consequent = parseStatement();
      }

      // 检查是否有 else
      let alternate = null;
      if (peek() === "else") {
        next(); // 吃掉 "else"

        // 解析 alternate（else 后面的语句块）
        if (peek() === "{") {
          next(); // 吃掉 "{"
          const body = [];
          while (peek() !== "}") {
            body.push(parseStatement());
          }
          next(); // 吃掉 "}"
          alternate = { type: "BlockStatement", body };
        } else {
          alternate = parseStatement();
        }
      }

      return {
        type: "IfStatement",
        test,
        consequent,
        alternate,
      };
    }
    // while 循环
    if (t === "while") {
      next(); // 吃掉 "while"
      next(); // 吃掉 "("
      const test = parseExpression(); // 解析条件表达式
      next(); // 吃掉 ")"

      // 解析循环体
      let body;
      if (peek() === "{") {
        next(); // 吃掉 "{"
        const bodyStatements = [];
        while (peek() !== "}") {
          bodyStatements.push(parseStatement());
        }
        next(); // 吃掉 "}"
        body = { type: "BlockStatement", body: bodyStatements };
      } else {
        body = parseStatement();
      }

      return {
        type: "WhileStatement",
        test,
        body
      };
    }
    // break 
    if (t === "break") {
      next();
      return { type: "BreakStatement" };
    }
    // continue
    if (t === "continue") {
      next();
      return { type: "ContinueStatement" };
    }
    // switch case default
    if (t === "switch") {
      next(); // 吃掉 "switch"
      next(); // 吃掉 "("
      const discriminant = parseExpression(); // switch 表达式
      next(); // 吃掉 ")"
      next(); // 吃掉 "{"

      const cases = [];
      let defaultCase = null;

      while (peek() !== "}") {
        const caseToken = peek();

        if (caseToken === "case") {
          next(); // 吃掉 "case"
          const test = parseExpression(); // case 的值
          next(); // 吃掉 ":"

          const consequent = [];
          while (peek() !== "}" && peek() !== "case" && peek() !== "default") {
            consequent.push(parseStatement());
          }

          cases.push({ type: "SwitchCase", test, consequent });
        } else if (caseToken === "default") {
          next(); // 吃掉 "default"
          next(); // 吃掉 ":"

          const consequent = [];
          while (peek() !== "}" && peek() !== "case") {
            consequent.push(parseStatement());
          }

          defaultCase = { type: "SwitchCase", test: null, consequent };
        } else {
          throw new Error(`Unexpected token in switch: ${caseToken}`);
        }
      }

      next(); // 吃掉 "}"

      return {
        type: "SwitchStatement",
        discriminant,
        cases,
        default: defaultCase
      };
    }
    // try catch finally
    if (t === "try") {
      next(); // 吃掉 "try"

      // 解析 try 块
      next(); // 吃掉 "{"
      const tryBody = [];
      while (peek() !== "}") {
        tryBody.push(parseStatement());
      }
      next(); // 吃掉 "}"

      let catchClause = null;
      let finallyBlock = null;

      // 检查是否有 catch
      if (peek() === "catch") {
        next(); // 吃掉 "catch"
        next(); // 吃掉 "("
        const param = next(); // catch 参数名
        next(); // 吃掉 ")"

        next(); // 吃掉 "{"
        const catchBody = [];
        while (peek() !== "}") {
          catchBody.push(parseStatement());
        }
        next(); // 吃掉 "}"

        catchClause = {
          type: "CatchClause",
          param: { type: "Identifier", name: param },
          body: { type: "BlockStatement", body: catchBody }
        };
      }

      // 检查是否有 finally
      if (peek() === "finally") {
        next(); // 吃掉 "finally"

        next(); // 吃掉 "{"
        const finallyBody = [];
        while (peek() !== "}") {
          finallyBody.push(parseStatement());
        }
        next(); // 吃掉 "}"

        finallyBlock = { type: "BlockStatement", body: finallyBody };
      }

      return {
        type: "TryStatement",
        block: { type: "BlockStatement", body: tryBody },
        handler: catchClause,
        finalizer: finallyBlock
      };
    }
    // throw
    if (t === "throw") {
      next(); // 吃掉 "throw"
      const argument = parseExpression(); // 解析要抛出的表达式
      return { type: "ThrowStatement", argument };
    }
    // 默认为表达式语句
    let expr = parseExpression(); // 解析表达式
    return { type: "ExpressionStatement", expression: expr }; // 返回表达式语句节点
  }

  // 解析程序入口（整个代码文件）
  const parseProgram = () => {
    let body = []; // 语句列表

    while (i < tokens.length) {
      // 遍历所有 token
      body.push(parseStatement()); // 解析每条语句
    }

    return { type: "Program", body }; // 返回程序节点
  };

  return parseProgram();
}

// 执行 AST
function evaluate(node, env) {
  switch (node.type) {
    case "Program": // 程序根节点
      let lastResult;
      for (let s of node.body) {
        const result = evaluate(s, env);
        // 只有表达式语句和返回语句才保存结果
        if (s.type === "ExpressionStatement" || s.type === "ReturnStatement") {
          lastResult = result;
        }
      }
      return lastResult;
    case "EmptyStatement":
      return;
    case "BlockStatement": // 代码块
      let result;
      for (const stmt of node.body) {
        result = evaluate(stmt, env);

        // 传播 break/continue/return
        if (result !== undefined &&
          typeof result === 'object' &&
          result !== null &&
          (result.__break || result.__continue || result.type === 'ReturnStatement')) {
          return result;
        }
      }
      return result;
    case "IfStatement": // if
      const testResult = evaluate(node.test, env);
      if (testResult) {
        return evaluate(node.consequent, env);
      } else if (node.alternate) {
        return evaluate(node.alternate, env);
      }
      return null;
    case "WhileStatement":
      while (evaluate(node.test, env)) {
        const result = evaluate(node.body, env);
        // 处理 break
        if (result && typeof result === 'object' && result.__break) {
          break;
        }
        // 处理 continue
        if (result && typeof result === 'object' && result.__continue) {
          continue;
        }
        // 如果返回了非 undefined 值，说明遇到了 return 语句
        if (shouldReturnFromLoop(node.body, result)) {
          return result;
        }
      }
      return null;

    case "SwitchStatement":
      const discriminantValue = evaluate(node.discriminant, env);
      const cases = node.cases;
      const defaultCase = node.default;

      let matched = false;
      let fallthrough = false;

      for (const caseNode of cases) {
        const testValue = evaluate(caseNode.test, env);
        if (testValue === discriminantValue || fallthrough) {
          matched = true;
          for (const stmt of caseNode.consequent) {
            const result = evaluate(stmt, env);
            if (result && typeof result === 'object' && result.__break) {
              return; // break 跳出 switch
            }
            if (shouldReturnFromLoop(stmt, result)) {
              return result;
            }
          }
          // 如果没有 break，继续执行下一个 case（fall-through）
          fallthrough = true;
        }
      }

      if (!matched && defaultCase) {
        for (const stmt of defaultCase.consequent) {
          const result = evaluate(stmt, env);
          if (result && typeof result === 'object' && result.__break) {
            return;
          }
          if (shouldReturnFromLoop(stmt, result)) {
            return result;
          }
        }
      }
      return;
    case "TryStatement":
      try {
        // 执行 try 块
        let result = evaluate(node.block, env);
        if (shouldReturnFromLoop(node.block, result)) {
          return result;
        }
      } catch (error) {
        // 如果有 catch 子句
        if (node.handler) {
          env[node.handler.param.name] = error.message || error;
          let result = evaluate(node.handler.body, env);
          if (shouldReturnFromLoop(node.handler.body, result)) {
            return result;
          }
        } else {
          // 没有 catch，重新抛出错误
          throw error;
        }
      } finally {
        // 如果有 finally 子句，总是执行
        if (node.finalizer) {
          let result = evaluate(node.finalizer, env);
          if (shouldReturnFromLoop(node.finalizer, result)) {
            return result;
          }
        }
      }
      return;
    case "ThrowStatement":
      const errorValue = evaluate(node.argument, env);
      throw new Error(errorValue);
    case "BreakStatement":
      return { __break: true };
    case "ContinueStatement":
      return { __continue: true };
    case "AssignmentExpression": // 赋值表达式
      let leftName = node.left.name;

      // 不能给常量赋值
      if (env._const && env._const.has(leftName)) {
        throw new Error(`TypeError: Assignment to constant variable '${leftName}'`);
      }
      let rightValue = evaluate(node.right, env);
      switch (node.operator) {
        case "=":
          env[leftName] = rightValue;
          return rightValue;
        case "+=":
          env[leftName] = env[leftName] + rightValue;
          return env[leftName];
        case "-=":
          env[leftName] = env[leftName] - rightValue;
          return env[leftName];
        case "*=":
          env[leftName] = env[leftName] * rightValue;
          return env[leftName];
        case "/=":
          env[leftName] = env[leftName] / rightValue;
          return env[leftName];
        default:
          throw new Error(`Unsupported assignment operator: ${node.operator}`);
      }
    case "VariableDeclaration": // 变量声明
      env[node.id] = evaluate(node.init, env); // 计算初始值并存入环境
      return;
    case "VariableDeclarationList":
      if (!env._const) env._const = new Set(); // 初始化常量集合
      // 变量就直接放env
      for (const decl of node.declarations) {
        const value = evaluate(decl.init, env);
        env[decl.id] = value;
        if (node.kind === "const") {
          // 常量放env._const
          env._const.add(decl.id);
        }
      }
      return;
    case "Literal": // 字面量
      return node.value; // 返回值本身
    case "Identifier": // 标识符（变量名）
      return env[node.name]; // 从环境查找值
    case "BinaryExpression": // 二元表达式
      let l = evaluate(node.left, env); // 左操作数
      let r = evaluate(node.right, env); // 右操作数
      // 根据操作符执行计算
      switch (node.operator) {
        // 算术运算
        case "+":
          return l + r;
        case "-":
          return l - r;
        case "*":
          return l * r;
        case "/":
          return l / r;
        case "%":  // 添加取模运算
          return l % r;

        // 比较运算
        case "==":
          return l == r;
        case "===":
          return l === r;
        case "!=":
          return l != r;
        case "!==":
          return l !== r;
        case "<":
          return l < r;
        case ">":
          return l > r;
        case "<=":
          return l <= r;
        case ">=":
          return l >= r;

        // 逻辑运算
        case "&&":
          return l && r;
        case "||":
          return l || r;
        default:
          throw new Error(`Unknown operator: ${node.operator}`);
      }
    case "ExpressionStatement":
      return evaluate(node.expression, env); // 表达式语句
    case "FunctionDeclaration": // 函数声明
      env[node.id] = (...args) => {
        // 在环境中保存函数
        let local = Object.create(env); // 创建局部作用域（原型链继承）
        node.params.forEach((p, i) => (local[p] = args[i])); // 设置参数
        for (let s of node.body) {
          // 执行函数体
          if (s.type === "ReturnStatement") return evaluate(s.argument, local); // 处理 return
          evaluate(s, local); // 执行其他语句
        }
      };
      return;
    case "CallExpression": // 函数调用
      return evaluate(
        node.callee,
        env
      )(...node.arguments.map((a) => evaluate(a, env))); // 执行函数
    case "ReturnStatement": // 返回语句
      return evaluate(node.argument, env); // 返回结果
    default:
      throw "Unknown node " + node.type; // 报错
  }
}

// 运行代码
function run(code) {
  return evaluate(parse(tokenize(code)), {}); // 词法 → 语法 → 执行，初始环境为空对象
}

export { run };
