/// <reference path ='Closures-fun-class.d.ts'/>

// const toStringChange = (...arg: string[]): Function => {
//     return (target: Cate, key: string, description: Object) => {
//         console.log(target, key, description)
//         arg.forEach((item: string) => {
//             if (target[item]) {
//                 Object.defineProperty(target, item, {
//                     enumerable: false
//                 })
//             }
//         })
//     }
// }

/**
 * @description 原本想通过装饰器给闭包加上toSting方法,不得,只能采用偏原生js的方法
 * 究其根本原因是因为没有找到办法访问闭包内的变量, decorate就写不下去了....
 * 
 * 装饰器本质就是编译时执行的函数。
 */

const initDesc = (target: Cate) => {
    debugger
    target.init = function () { console.log('init excute', target.a) }
    target.init()
}


@initDesc
class Mat {
    constructor(a: number) { }
    add(i: number): Function {
        let result = 0;
        result = i
        let add = function (x: number) {
            result += x;
            return add
        }
        add.toString = function (): string {
            return `${result}`
        }
        return add
    }
}



console.log(new Mat(1).add(0)(1)(2)(3))

