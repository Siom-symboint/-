```
defineProperty（真）浅谈数据双向绑定
近一年都在用vue做内部管理系统，前端开发中采用这个MVVM的模式时最爽快的莫过于在html中使用命令进行数据的双向绑定，极简了我们的开发流程，UI控件的变动通过处理数据来完成，数据的变化也将自动反应到页面上来，下面就简单研究一下vue双向绑定的原理。
VueJS 则使用 ES5 提供的 Object.defineProperty() 方法，监控对数据的操作，从而可以自动触发数据同步。并且，由于是在不同的数据上触发同步，可以精确的将变更发送给绑定的视图，而不是对所有的数据都执行一次检测（AngularJS的"脏值检测"即为这种方法）。
Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调，实现数据的双向绑定：
首先看一下官方的定义：


Object.defineProperty()

方法会直接在一个对象上定义一个新属性，或者修改一个已经存在的属性， 并返回这个对象。
语法：Object.defineProperty(obj,prop,descriptor)
参数：
obj：需要定义属性的对象。
prop：需定义或修改的属性的名字。
descriptor：将被定义或修改的属性的描述符。
返回值：返回传入函数的对象，即第一个参数obj。
descriptor接收一个属性描述符的集合，主要有有两种主要形式：数据描述符和存取描述符;
#数据描述符是一个具有值的属性，该值可能是可写的，也可能不是可写的。
​```js
//以下为数据描述符可同时存在的属性
Object.defineProperty(obj, 'key', {
enumerable: false,//默认为false
configurable: false,//默认为false
writable: false,//默认为false
value: 'static'
});
​```
configurable
当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，同时该属性也能从对应的对象上被删除。默认为 false。
具体体现在两点：
是否能被删除（obj.delete）
是否能被重新define（通过Object.defineProperty）
enumerable
当且仅当该属性的enumerable为true时，该属性才能够出现在对象的枚举属性(即在for...in 循环和 Object.keys() 中被枚举。)中。默认为 false。
数据描述符同时具有以下可选键值：
value
该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。
writable
当且仅当该属性的writable为true时，value才能被赋值运算符改变。默认为 false。
**当configurable设置为false时，writable也只能被设置为false
#存取描述符是由getter-setter函数对描述的属性。描述符必须是这两种形式之一；不能同时是两者。
存取描述符同时具有以下可选键值：
​```JS
//以下为数据存储符可同时存在的属性
let obj = {}
let val = 2
Object.defineProperty(obj, "key", {
get(){
return val;
},
set(newValue){
val = newValue;
},
enumerable : true,
configurable : true
});
obj.key // 2
//一般写法
let obj = {}
obj.key //undefined 
// 数据描述符和存取描述符不能混合使用
Object.defineProperty(o, "conflict", {
value: 1, 
get() { 
return 1; 
} 
});
// throws a TypeError: value appears only in data descriptors, get appears only in accessor descriptors
​```
get
一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。该方法返回值被用作属性值。默认为 undefined。
set
一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为 undefined。

从文档可以看出，通过defineProerty可以劫持对象属性的设置和读取，显然实现数据双向绑定是getter/setter来做的，

那么首先，我们需要给data下的所有对象进行递归遍历，包括子属性对象的属性都加上 setter和getter

​```js
function defineReactive(data, key, val) {
observe(val); // 监听子属性
Object.defineProperty(data, key, {
enumerable: true, // 可枚举
configurable: false, // 不能再define
get() {
return val;
},
set(newVal) {
console.log('数据变化', val, ' --> ', newVal);
//code...
val = newVal;
}
});
}

function observe(data) {
if (!data || typeof data !== 'object') {
return;
}
// 取出所有属性遍历
Object.keys(data).forEach(function(key) {
defineReactive(data, key, data[key]);
});
};
​```
通过以上代码可以给data下所有子属性添加上getter/setter，对属性的读取和设置进行劫持操作。

以下为简单的通过defineProerty实现双向绑定
​```HTML
<!DOCTYPE html>
<head></head>
<body>
<div id="app">
<input type="text" id="a">
<span id="b"></span>
</div>

<script type="text/javascript">
var obj = {};
Object.defineProperty(obj, 'hello', {
get: function() {
return val;
},
set: function(newVal) {
val = newVal;
console.log('set val:'+ val);
document.getElementById('a').value = val;
document.getElementById('b').innerHTML = val;
}
});
document.addEventListener('keyup', function(e) {
obj.hello = e.target.value;
});
//or
obj.hello = 'TEST'

</script>
</body>
</html>
​```
#页面交互变化触发数据变化: keyup事件触发=>obj的hello属性触发=>setter劫持器触发=>数据变化=>span内文本变化
#数据变化引发页面变化:=>obj的hello属性触发=>setter劫持器触发=>数据变化=>span内文本变化


- 显然订阅者需要维护一个list，那么在给data设置存取描述符时，需要将订阅者和数据绑定起来，每个数据需要自己的一个订阅者list
​```JS
function Dep () {
this.DepList = [];
}
Dep.prototype = {
addSub(dep) {
this.DepList.push(dep);
},
notify() {
this.DepList.forEach(function(dep) {
dep.update();//更新视图方法
});
}
};
function defineReactive(data, key, val) {
let dep = new Dep()//维护一个订阅者list
observe(val); // 监听子属性
Object.defineProperty(data, key, {
enumerable: true, // 可枚举
configurable: false, // 不能再define
get: function() {
if(isDepNeed){//如果有对应的setter
dep.addSub(watcher); 
}
return val;
},
set: function(newVal) {
console.log('数据变化', val, ' --> ', newVal);
//code...
dep.notify();
val = newVal;
}
});
}

function observe(data) {
if (!data || typeof data !== 'object') {
return;
}
// 取出所有属性遍历
Object.keys(data).forEach(function(key) {
defineReactive(data, key, data[key]);
});
};
​```
从设计上看,每个属性/子属性都可能对应到1个/多个订阅者，完整的实现vue的双向绑定需要解析模板指令，收集订阅者，将模板中的变量替换成
数据，具体怎么获取对应的元素，以及watcher的作用，再到初始化渲染页面视图的过程，之后再做研究。 后续更新...
```