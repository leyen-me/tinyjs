// 父对象
const parent = {
  name: 'parent',
  parentMethod() {
    console.log('parent method');
  }
};

// 子对象通过原型链继承父对象
const child = Object.create(parent);

if(!child.hasOwnProperty('name')){
  child.__proto__.name = '211'
}

console.log(parent.name);
