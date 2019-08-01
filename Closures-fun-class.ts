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
 */


class Mat {
    add(i: number): Function {
        let result = 0;
        result = i
        let add = function (x: number) {
            result += x;
            return add
        }
        return add
    }
}



console.log(new Mat().add(0)(1)(2)(3))