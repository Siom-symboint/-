/**
 * 
 * @param {string} type  运算法则
 */
function mat(type) {
    let result;
    switch (type) {
        case 'add':
            result = 0;
            return function (x) {
                result += x
                var add = function (y) {
                    result += y
                    return add
                }
                add.toString = function () {
                    return result
                }

                return add
            }
            break;
        case 'ride':
            result = 1
            return function (x) {
                result *= x
                var ride = function (y) {
                    result *= y
                    return ride
                }
                ride.toString = function () {
                    return result
                }
                return ride
            }
            break;
        default:
            break;
    }

}

console.log(mat('ride')(2)(3)(5))



/** 
 * @description
 * 词法作用域在初始化的时候已经决定了，和运行时在什么位置没有关系，这也是闭包的原理
 * 这里会输出10的原因,是因为变量提升的作用,先执行过了 var foo;
 * 所以会出现三种情况
 * ********************************
 * function bar() {
    console.log(foo)
    if (!foo) {
        var foo ;
    }
    console.log(foo); undefined
   }
******************************
 * function bar() {
    console.log(foo)
    if (!foo) {
        console.log('我不会被执行') 
    }
    console.log(foo); 1
   }
******************************
 * function bar() {
    console.log(foo)
    if (!foo) {
        var foo  = 10;
    }
    console.log(foo); 10
   }
******************************

 */
var foo = 1;

function bar() {
    console.log(foo)
    if (!foo) {
        var foo = 10;
    }
    console.log(foo);
}
bar();



/**
 * @description 词法环境包含了这个闭包创建时所能访问的所有局部变量
 * foo被创建时的词法环境是没有a变量的,Lexical Environments 即最外层的词法黄精才有a变量
 * 词法作用域在初始化的时候已经决定了，和运行时在什么位置没有关系，这也是闭包的原理
 */
function fun() {
    console.log(a);
}

function bar() {
    var a = 3;
    fun();
}

var a = 2;
bar();