class MyPromise {
    constructor(excute) {
        this.state = 'pending'
        this.value = ''
        this.reason = ''
        this.onfullilledFunc = []
        this.onRejectedFunc = []
        try {
            /**
             * 本质上是then方法先运行，把then里面的回调缓存进执行队列中，
             * 在resolve方法执行的时候，再执行 执行队列里的then回调，同时把resolve里面的传参带给then中
             * 本质上就是实现在resove执行后再执行then回调====也可以理解为再resolve里面执行then方法
             */
            excute(this.resolve.bind(this), this.reject.bind(this))
        } catch (error) {
            this.reject(error).bind(this)
        }
    }
    resolve(resArg) {
        console.log('我是resolve 函数执行了')
        this.value = resArg
        this.onfullilledFunc.forEach(thenCb => {
            thenCb(resArg)
        })
        this.state = 'resolve'
    }

    reject(rejectArg) {
        this.reason = rejectArg
        this.onRejectedFunc.forEach(catchhCb => catchhCb(rejectArg))
        this.state = 'reject'
    }
    catch (catchhCb) {
        return this.then(null, catchhCb)
    }


    then(thenCb, catchhCb) {
        //成功和失败默认不穿给一个函数

        thenCb = typeof thenCb === 'function' ? thenCb : function (value) {
            return value;
        }
        catchhCb = typeof catchhCb === 'function' ? catchhCb : function (err) {
            throw err;
        }
        // let this = this;
        let promise2; //返回的promise
        switch (this.state) {
            case 'pending':
                promise2 = new MyPromise((resolve, reject) => {
                    // 此时没有resolve 也没有reject

                    this.onfullilledFunc.push(() => {
                        setImmediate(() => {
                            try {
                                let x = thenCb(this.value);
                                this.resolvePromise(promise2, x, resolve, reject);
                            } catch (e) {
                                reject(e)
                            }
                        })
                    });
                    this.onRejectedFunc.push(() => {
                        setImmediate(() => {
                            try {
                                let x = catchhCb(this.reason);
                                this.resolvePromise(promise2, x, resolve, reject);
                            } catch (e) {
                                reject(e);
                            }
                        })
                    });
                })
                break;
            case 'resolve':
                promise2 = new MyPromise((resolve, reject) => {
                    // 当成功或者失败执行时有异常那么返回的promise应该处于失败状态
                    // x可能是一个promise 也有可能是一个普通的值
                    setImmediate(() => {

                        try {
                            let x = thenCb(this.value);
                            // x可能是别人promise，写一个方法统一处理
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    })
                })
                break;
            case 'reject':
                promise2 = new MyPromise((resolve, reject) => {
                    setImmediate(() => {
                        try {
                            let x = catchhCb(this.reason);
                            this.resolvePromise(promise2, x, resolve, reject);
                        } catch (e) {
                            reject(e);
                        }
                    })

                })
                break;

            default:
                break;
        }

        return promise2;
    }

    /**
     * 解析then返回值与新Promise对象
     * @param {Object} promise2 新的Promise对象 
     * @param {*} x 上一个then的返回值
     * @param {Function} resolve promise2的resolve
     * @param {Function} reject promise2的reject
     */
    resolvePromise(promise2, x, resolve, reject) {
        // 有可能这里返回的x是别人的promise
        // 尽可能允许其他乱写
        if (promise2 === x) { //这里应该报一个类型错误，有问题
            return reject(new TypeError('循环引用了'))
        }
        // 看x是不是一个promise,promise应该是一个对象
        let called; // 表示是否调用过成功或者失败
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
            // 可能是promise {},看这个对象中是否有then方法，如果有then我就认为他是promise了
            try { // {then:1}
                let then = x.then;
                if (typeof then === 'function') {
                    // 成功
                    then.call(x, (y) => {
                        if (called) return
                        called = true
                        // y可能还是一个promise，在去解析直到返回的是一个普通值
                        this.resolvePromise(promise2, y, resolve, reject)
                    }, (err) => { //失败
                        if (called) return
                        called = true
                        reject(err);
                    })
                } else {
                    resolve(x)
                }
            } catch (e) {
                if (called) return
                called = true;
                reject(e);
            }
        } else { // 说明是一个普通值1
            resolve(x); // 表示成功了
        }
    }
}



// const mp = new MyPromise((res, rej) => {
//     console.log('这个函数体中的代码是立即执行的,我就是构造函数里面的excutor')
//     setTimeout(() => {
//         res('我是resolve参数')
//     }, 2000);
// }).then(res => {
//     console.log('then里面的回调是什么时候执行的？是在resolve里面遍历执行的')
//     console.log(res)
//     return 1
// })






class Mp {
    constructor(excute) {
        this.value = null;
        this.reason = null;
        this.onfullilledFunc = []
        this.onRejectedFunc = []
        this.state = 'pending'
        excute(this.resolve.bind(this), this.reject.bind(this))
    }

    resolve(value) {
        this.value = value;
        this.onfullilledFunc.forEach(f => {
            f(value)
        })
        this.state = 'onfullied'
    }

    reject(reason) {
        this.reason = reason;
        this.onfullilledFunc.forEach(f => {
            f(reason)
        })
        this.state = 'onrejected'
    }

    then(resolveCb, rejectCb) {
        switch (this.state) {
            case 'pending':
                this.onfullilledFunc.push(resolveCb)
                this.onRejectedFunc.push(rejectCb)
                break;
            case 'onfullied':
                this.onfullilledFunc.push(resolveCb)
                break;
            case 'onrejected':
                this.onRejectedFunc.push(rejectCb)
                break;

            default:
                break;
        }

    }

    catch (rejectCb) {
        this.then(null,rejectCb)
    }

}

new Mp((res, rej) => {
    console.log('这个函数体中的代码是立即执行的,我就是构造函数里面的excutor')
    setTimeout(() => {
        res('我是resolve参数')
    }, 2000);
}).then(res => {
    console.log('then里面的回调是什么时候执行的？是在resolve里面遍历执行的')
    console.log(res)
    return 1
})