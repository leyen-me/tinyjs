function tokenize(code) {
  const regex=/\s*(=>|{|}|\(|\)|;|,|=|\+|\-|\*|\/|return|function|let|[A-Za-z_]\w*|\d+)\s*/g;
  return [...code.matchAll(regex)].map(m=>m[1]);
}
function parse(tokens){
  let i=0;
  const peek=()=>tokens[i],next=()=>tokens[i++];
  function parsePrimary(){
    const t=next();
    if(/^\d+$/.test(t))return{type:"Literal",value:+t};
    if(t==="("){const e=parseExpression();next();return e;}
    if(/^[A-Za-z_]\w*$/.test(t)){
      let node={type:"Identifier",name:t};
      if(peek()==="("){
        next();let args=[];
        while(peek()!==")"){args.push(parseExpression());if(peek()===",")next();}
        next();node={type:"CallExpression",callee:node,arguments:args};
      }return node;
    }
    return{type:"Identifier",name:t};
  }
  function parseBinary(left){
    while(["+","-","*","/"].includes(peek())){
      let op=next(),right=parsePrimary();
      while(["+","-","*","/"].includes(peek()))right=parseBinary(right);
      left={type:"BinaryExpression",operator:op,left,right};
    }return left;
  }
  const parseExpression=()=>parseBinary(parsePrimary());
  function parseStatement(){
    let t=peek();
    if(t==="let"){next();let name=next();next();let init=parseExpression();next();return{type:"VariableDeclaration",id:name,init};}
    if(t==="function"){
      next();let name=next();next();let params=[];
      while(peek()!==")"){params.push(next());if(peek()===",")next();}
      next();next();let body=[];while(peek()!=="}")body.push(parseStatement());next();
      return{type:"FunctionDeclaration",id:name,params,body};
    }
    if(t==="return"){next();let arg=parseExpression();next();return{type:"ReturnStatement",argument:arg};}
    let expr=parseExpression();next();return{type:"ExpressionStatement",expression:expr};
  }
  const parseProgram=()=>{let body=[];while(i<tokens.length)body.push(parseStatement());return{type:"Program",body};};
  return parseProgram();
}
function evaluate(node,env){
  switch(node.type){
    case"Program":let r;for(let s of node.body)r=evaluate(s,env);return r;
    case"VariableDeclaration":env[node.id]=evaluate(node.init,env);return;
    case"Literal":return node.value;
    case"Identifier":return env[node.name];
    case"BinaryExpression":
      let l=evaluate(node.left,env),rr=evaluate(node.right,env);
      return node.operator=="+"?l+rr:node.operator=="-"?l-rr:node.operator=="*"?l*rr:l/rr;
    case"ExpressionStatement":return evaluate(node.expression,env);
    case"FunctionDeclaration":
      env[node.id]=(...args)=>{let local=Object.create(env);
        node.params.forEach((p,i)=>local[p]=args[i]);
        for(let s of node.body){if(s.type==="ReturnStatement")return evaluate(s.argument,local);evaluate(s,local);}
      };return;
    case"CallExpression":return evaluate(node.callee,env)(...node.arguments.map(a=>evaluate(a,env)));
    case"ReturnStatement":return evaluate(node.argument,env);
    default:throw"Unknown node "+node.type;
  }
}
function run(code){return evaluate(parse(tokenize(code)),{});}
console.log(run("let x=2+3*4; x;"));
console.log(run("function add(a,b){return a+b;} add(10,20);"));
