import Rx = require('rxjs');
import {
    Observer
} from 'rxjs';

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
var observable = Rx.Observable.create(function (observer: Observer < number > ) {
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
    as Observer < number > );
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
    next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
    next: (v) => console.log('observerB: ' + v)
});
subject.next(1);
subject.next(2);
//observerA: 1observerB: 1observerA: 2observerB:

subject.subscribe({
    next: (v) => console.log('observerA: ' + v)
});
subject.subscribe({
    next: (v) => console.log('observerB: ' + v)
});
var observable = Rx.Observable.from([1, 2, 3]);
observable.subscribe(subject); // You can subscribe providing a Subject