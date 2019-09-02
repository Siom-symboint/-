import * as Rx from 'rxjs';
import {
    Observer, Observable,
} from 'rxjs';
import "rxjs-compat"
/**
 * @deprecated the core step
 * 
 * Creating Observables   创建观察对象
 * Subscribing to Observables  观察观察对象
 * Executing the Observable   执行->可观察对象
 * Disposing Observabl    订阅 ->可观察对象
 */

/**
 * @description an observerAble (观察对象)
 */
var observable = Rx.Observable.create(function (observer: Observer<number>) {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    setTimeout(() => {
        observer.next(4);
        observer.complete();
    }, 1000);
})


console.log('just before subscribe');
/**
 * @description  an observing (action)
 * @param  observer   an observer (观察者)  也可以直接通过讲三哥函数作为参数提供回调
 * observable.subscribe(
 *  error: (err: any) => console.error('something wrong occurred: ' + err),
 *   complete: () => console.log('done'),
 *   next: (x: number) => console.log('got value ' + x),
 *   );
 */
observable.subscribe({
    next: (x: number) => console.log('got value ' + x),
    error: (err: any) => console.error('something wrong occurred: ' + err),
    complete: () => console.log('done'),
}
);
console.log('just after subscribe')

/** 
 * @description  订阅       
 * ？订阅是一个表示一次性资源的对象，通常是一个可观察对象的执行。
 * 订阅对象有一个重要的方法:unsubscribe，该方法不需要参数，仅仅去废弃掉可观
 * 察对象所持有的资源。在以往的RxJS的版本中，"Subscription订阅"被称
 * 为"Disposable"。
 */
const subscription = observable.subscribe()

const childSubscription = Rx.Observable.create().subscribe()

// 通过 add 方法加入子订阅  父订阅unsubscribe以后子订阅也会解除订阅 
// 也可以通过个 remove(otherSubscription)方法解除子订阅
subscription.add(childSubscription)
// ，该方法不需要参数，仅仅去废弃掉可观
subscription.unsubscribe()


/**
 * Subject就是一个observable可观察对象，只不过可以被多播至多个观察者observe。同时Subject也类似于EventEmitter:维护者着众多事件监听器的注册
 * 更同时Subject本身也是一个观察者
 */

var subject = new Rx.Subject();
subject.subscribe({
    next: (v) => console.log('observerA  from : ' + v)
});
subject.subscribe({
    next: (v) => console.log('observerB from : ' + v)
});
// subject.next(1);
// subject.next(2);
//observerA: 1observerB: 1observerA: 2observerB:


observable = Rx.Observable.from([1, 2, 3]);
observable.subscribe(subject); // You can subscribe providing a Subject
/**
 * 用上面的方式，我们本质上是通过将一个单播的可观察对象转化为多播。这个演示了Subjects是任何将可观察对象执行分享给多个观察者。
 * (译者注:注意观察上面的两个subject.subscribe()中传入的两个观察者对象
 * 一个"多播的可观察对象"通过具有多个订阅者的Subject对象传递通知。然而一个单纯的"单播可观察对象"仅仅给一个单一的观察者发送通
 */


subject = new Rx.ReplaySubject(3)

subject.subscribe({
    next: (v) => console.log('observerA：' + v)
})

subject.next(1)
subject.next(2)
subject.next(3)
subject.next(4)

subject.subscribe({
    next: (v) => console.log('observerB：' + v)
})

subject.next(5)

/**
 * 
 * @param Operators An Operator is a function which creates a new Observable based on the current Observable. This is a pure operation: the previous Observable stays unmodified.
 * Operators are methods on the Observable type, such as .map(...), .filter(...), .merge(...), etc. When called, they do not change the existing Observable instance. Instead,
 *  they return a new Observable, whose subscription logic is based on the first Observable.
 */

function multiplyByTen(input: Observable<unknown>) {
    var output = Rx.Observable.create(function (observer: Observer<unknown>) {
        input.subscribe({
            next: (v: any) => observer.next(10 * v),
            error: (err: any) => observer.error(err),
            complete: () => observer.complete()
        });
    });
    return output;
}


var input = Rx.Observable.from([1, 2, 3, 4]);
var output = multiplyByTen(input); output.subscribe((x: any) => console.log(x));




/**
 * 这是因为observeOn（Rx.Scheduler.async）在 Observable.create和最终的Observer之间引入了一个代理Observer。 让我们重命 名一些标识符，使这个重要的区别在下面代码中显而易见
 * proxyObserver在 observeOn(Rx.Scheduler.async)被创建，它的next通知函数大约 如下:
 * var proxyObserver = { 
 *      next: (val) => { 
 *          Rx.Scheduler.async.schedule( (x) => finalObserver.next(x), 0 , val /* will be the x for the function above  ); 
 *     },
 */
var observable = Rx.Observable.create(function (proxyObserver: any) {
    proxyObserver.next(1);
    proxyObserver.next(2); 
    proxyObserver.next(3); 
    proxyObserver.complete();
}).observeOn(Rx.asyncScheduler);
var finalObserver = {
    next: (x: any) => console.log('got value ' + x),
    error: (err: any) => console.error('something wrong occurred: ' + err),
    complete: () => console.log('done'),
};
console.log('just before subscribe');
observable.subscribe(finalObserver); console.log('just after subscribe');