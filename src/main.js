// 词法分析
function tokenize(code) {
  // 使用正则表达式匹配代码中的 token，如关键字、符号、标识符、数字等
  // 在词法分析阶段，通过正则表达式中的 \s* 来过滤空格和换行符
  const regex =
    /\s*(=>|{|}|\(|\)|;|,|\?|=|\+|\-|\*|\/|return|function|let|[A-Za-z_]\w*|\d+)\s*/g;

  // matchAll 匹配所有符合正则的内容，然后用 map 提取出匹配的 token（m[1] 是捕获组）
  let tokens = [...code.matchAll(regex)].map((m) => m[1]);
  tokens = tokens.filter(token => token !== ';'); // js 对分号可有可无
  console.log(tokens);
  return tokens
}

// 语法分析
function parse(tokens) {
  let i = 0; // 当前解析的位置索引
  const peek = () => tokens[i]; // peek：查看当前 token，但不移动索引
  const next = () => tokens[i++]; // next：获取当前 token，并将索引前移

  // 解析基本表达式（数字、括号、标识符、函数调用等）
  function parsePrimary() {
    const t = next(); // 取出当前 token

    if (!t) throw new Error("Unexpected end of input");

    // 如果是数字
    if (/^\d+$/.test(t)) return { type: "Literal", value: +t }; // 转为数字字面量

    // 如果是左括号
    if (t === "(") {
      const e = parseExpression(); // 递归解析括号内的表达式
      next(); // 吃掉右括号 ")"
      return e; // 返回括号内的表达式
    }

    // 如果是标识符
    if (/^[A-Za-z_]\w*$/.test(t)) {
      let node = { type: "Identifier", name: t }; // 构造标识符节点
      // 如果标识符后面是左括号，说明是函数调用
      if (peek() === "(") {
        next(); // 吃掉 "("
        let args = []; // 参数列表
        while (peek() !== ")") {
          args.push(parseExpression()); // 添加参数
          if (peek() === ",") next(); // 如果有逗号，吃掉
        }
        next(); // 吃掉 ")"
        node = { type: "CallExpression", callee: node, arguments: args }; // 构造调用节点
      }
      return node;
    }

    // 添加错误检查
    throw new Error(`Unexpected token: ${t}`);
  }

  // 解析乘除法（高优先级）
  function parseMultiplicative() {
    let left = parsePrimary();
    while (peek() === "*" || peek() === "/") {
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

  // 解析表达式入口
  const parseExpression = parseAdditive;

  // 解析语句（let、function、return、普通表达式等）
  function parseStatement() {
    let t = peek(); // 看当前 token

    if (t === ";") {
      // 空语句
      next(); // 吃掉分号
      return { type: "EmptyStatement" };
    }

    // 变量声明
    if (t === "let") {
      next(); // 吃掉 "let"
      let name = next(); // 变量名
      next(); // 吃掉 "="
      let init = parseExpression(); // 解析初始化表达式
      // 返回变量声明节点
      return { type: "VariableDeclaration", id: name, init };
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

    if (t === "return") {
      // 返回语句
      next(); // 吃掉 "return"
      let arg = parseExpression(); // 解析返回值
      return { type: "ReturnStatement", argument: arg }; // 返回返回语句节点
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
    case "VariableDeclaration": // 变量声明
      env[node.id] = evaluate(node.init, env); // 计算初始值并存入环境
      return;
    case "Literal": // 字面量
      return node.value; // 返回值本身
    case "Identifier": // 标识符（变量名）
      return env[node.name]; // 从环境查找值
    case "BinaryExpression": // 二元表达式
      let l = evaluate(node.left, env), // 左操作数
        rr = evaluate(node.right, env); // 右操作数

      // 根据操作符执行计算
      return node.operator == "+"
        ? l + rr
        : node.operator == "-"
        ? l - rr
        : node.operator == "*"
        ? l * rr
        : l / rr;
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
function run(code) {
  return evaluate(parse(tokenize(code)), {}); // 词法 → 语法 → 执行，初始环境为空对象
}

export { run }