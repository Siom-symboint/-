import * as Rx from 'rxjs';
import {
    Observer, Observable, Subscribable, Subscriber,
} from 'rxjs';
import { take, map, combineAll } from 'rxjs/operators';
import "rxjs-compat"
import { mapTo } from 'rxjs-compat/operator/mapTo';
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
 * 当作为一个observable 时,想要提供新的值就调用next()方法,其结果会被多播(广播)到作为subscrible()的argument的observer(观察者)中去
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




// Dynamically calculate the Body-Mass Index from an Observable of weight and one for height 
/**
 * the last item of arg[0]  and each arg[1] put into the arg[2] as the arguments
 * which named combileLatests
 * as the result
 * 75 1.76
 * VM590:1
 * BMI is 24.212293388429753
 * rx.ts:162
 * 75 1.77
 * rx.ts:161
 * BMI is 23.93948099205209
 * rx.ts:162
 * 75 1.78
 * rx.ts:161
 * BMI is 23.671253629592222
 */
var weight = Rx.Observable.of(70, 72, 76, 79, 75);
var height = Rx.Observable.of(1.76, 1.77, 1.78);
var bmi = Rx.Observable.combineLatest(weight, height, (w: number, h: number) => { console.log(w, h); return w / (h * h) });
// bmi.subscribe(x => console.log('BMI is ' + x));




// 每秒发出值，并只取前2个
const source = Rx.interval(1000).pipe(take(2));
// 将 source 发出的每个值映射成取前5个值的 interval observable
const example = source.pipe(
    map(val => Rx.interval(1000).pipe(map(i => `Result (${val}): ${i}`), take(5)))
);
/*
  soure 中的2个值会被映射成2个(内部的) interval observables，
  这2个内部 observables 每秒使用 combineLatest 策略来 combineAll，
  每当任意一个内部 observable 发出值，就会发出每个内部 observable 的最新值。
*/
const combined = example.pipe(combineAll());
// const subscribe = combined.subscribe(val => console.log(val));

/*
  输出:
  ["Result (0): 0", "Result (1): 0"]
  ["Result (0): 1", "Result (1): 0"]
  ["Result (0): 1", "Result (1): 1"]
  ["Result (0): 2", "Result (1): 1"]
  ["Result (0): 2", "Result (1): 2"]
  ["Result (0): 3", "Result (1): 2"]
  ["Result (0): 3", "Result (1): 3"]
  ["Result (0): 4", "Result (1): 3"]
  ["Result (0): 4", "Result (1): 4"]
*/



// explation of  'concat', excute in the way that order  and sync

var timer = Rx.Observable.interval(1000).take(4);
var sequence = Rx.Observable.range(1, 10);
var result = Rx.Observable.concat(timer, sequence);
result.subscribe(x => console.log(x));


var timer1 = Rx.Observable.interval(1000).take(10);
var timer2 = Rx.Observable.interval(2000).take(6);
var timer3 = Rx.Observable.interval(500).take(10);
var result = Rx.Observable.concat(timer1, timer2, timer3);
result.subscribe(x => console.log(x));



result = Rx.Observable.create(function (observer: Observer<number>) {
    observer.next(Math.random());
    observer.next(Math.random());
    observer.next(Math.random());
    observer.complete();
});
result.subscribe(x => console.log(x));



var interval = Rx.Observable.interval(1000)
var result = interval.mergeMap(x =>
    x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.
        empty()
);
result.subscribe(x => console.log(x))



/**
 * @description  merge description
 */

// 每2.5秒发出值
const first = Rx.Observable.interval(500).mapTo('showway');
// 每1秒发出值
const second = Rx.Observable.interval(500);
// 作为实例方法使用
const exam = Rx.Observable.merge(first, second)
// 输出: 0,1,0,2....
const subscribe = exam.subscribe(val => console.log(val, 'from 259', new Date().getTime()));