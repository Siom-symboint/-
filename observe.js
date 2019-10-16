//观察者
export default class Observer {
    constructor(value) {
        this.value = value
        this.walk(value)
    }
    //递归。。让每个字属性可以observe
    walk(value) {
        Object.keys(value).forEach(key => this.convert(key, value[key]))
    }
    convert(key, val) {
        defineReactive(this.value, key, val)
    }
}


export function defineReactive(obj, key, val) {
    var childOb = observe(val)
    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,
        get: () => val,
        set: newVal => {
            childOb = observe(newVal) //如果新赋值的值是个复杂类型。再递归它，加上set/get。。
        }
    })
}


export function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return
    }
    return new Observer(value)
}


class Dep {
    constructor() {
        this.subs = []
    }
    addSub(sub) {
        this.subs.push(sub) // 添加订阅者
    }
    notify() {
        this.subs.forEach(sub => sub.update()) // 伪代码
    }
}